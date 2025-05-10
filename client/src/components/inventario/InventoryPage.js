import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaSort,
  FaSyncAlt
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importar componentes
import InventoryDashboard from './InventoryDashboard';
import InventoryTable from './InventoryTable';

const InventoryPage = () => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Estados para las estadísticas del dashboard
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    totalValue: 0,
    unitsInStock: 0
  });

  // Estado para actualización masiva
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar productos y calcular estadísticas
  const loadProductsAndStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      
      const data = await response.json();
      setProducts(data);
      
      // Calcular estadísticas de inventario
      if(data.length > 0) {
        // Extraer categorías únicas
        const categories = [...new Set(data.map(product => product.category))].filter(Boolean).length;
        
        // Productos con stock bajo (menos de 10 unidades)
        const lowStockItems = data.filter(product => (product.stock || 0) < 10).length;
        
        // Valor total del inventario
        const totalValue = data.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0);
        
        // Total de unidades en stock
        const unitsInStock = data.reduce((sum, product) => sum + (product.stock || 0), 0);
        
        setStats({
          totalProducts: data.length,
          totalCategories: categories,
          lowStock: lowStockItems,
          totalValue: totalValue,
          unitsInStock: unitsInStock
        });
      }
    } catch (err) {
      setError('No se pudieron cargar los productos: ' + err.message);
      toast.error('Error al cargar los productos');
      
      // Datos de muestra en caso de error
      setProducts([
        { 
          _id: 'p1', 
          name: 'Pan Francés', 
          category: 'Panes', 
          price: 150, 
          stock: 50,
          unit: 'unidad',
          description: 'Pan francés tradicional'
        },
        { 
          _id: 'p2', 
          name: 'Facturas surtidas', 
          category: 'Facturas', 
          price: 100, 
          stock: 24,
          unit: 'unidad',
          description: 'Facturas variadas'
        },
        { 
          _id: 'p3', 
          name: 'Torta de chocolate', 
          category: 'Tortas', 
          price: 3500, 
          stock: 3,
          unit: 'kg',
          description: 'Torta de chocolate con dulce de leche'
        },
        { 
          _id: 'p4', 
          name: 'Pionono', 
          category: 'Tortas', 
          price: 2800, 
          stock: 2,
          unit: 'unidad',
          description: 'Pionono de vainilla'
        }
      ]);
      
      // Estadísticas de muestra
      setStats({
        totalProducts: 4,
        totalCategories: 3,
        lowStock: 2,
        totalValue: 21000,
        unitsInStock: 79
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProductsAndStats();
  }, []);

  // Filtrar productos según búsqueda y filtros
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Filtro por búsqueda
      const matchesSearch = 
        !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = 
        categoryFilter === 'all' ||
        product.category === categoryFilter;
      
      // Filtro por stock
      const stock = product.stock || 0;
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'low' && stock < 10) ||
        (stockFilter === 'out' && stock === 0) ||
        (stockFilter === 'available' && stock > 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  };
  
  // Ordenar productos
  const getSortedProducts = (products) => {
    return [...products].sort((a, b) => {
      if(sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else if(sortBy === 'price_asc') {
        return (a.price || 0) - (b.price || 0);
      } else if(sortBy === 'price_desc') {
        return (b.price || 0) - (a.price || 0);
      } else if(sortBy === 'stock_asc') {
        return (a.stock || 0) - (b.stock || 0);
      } else if(sortBy === 'stock_desc') {
        return (b.stock || 0) - (a.stock || 0);
      }
      return 0;
    });
  };
  
  // Obtener todas las categorías únicas para los filtros
  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
    return categories;
  };
  
  const filteredProducts = getFilteredProducts();
  const sortedProducts = getSortedProducts(filteredProducts);
  const uniqueCategories = getUniqueCategories();
  
  // Actualizar stock de un producto
  const handleUpdateStock = async (id, newStock) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      // Actualizar el estado local
      setProducts(products.map(product => 
        product._id === id ? { ...product, stock: newStock } : product
      ));
      
      // Recalcular estadísticas
      const updatedProducts = products.map(product => 
        product._id === id ? { ...product, stock: newStock } : product
      );
      
      // Productos con stock bajo (menos de 10 unidades)
      const lowStockItems = updatedProducts.filter(product => (product.stock || 0) < 10).length;
      
      // Valor total del inventario
      const totalValue = updatedProducts.reduce((sum, product) => 
        sum + ((product.price || 0) * (product.stock || 0)), 0
      );
      
      // Total de unidades en stock
      const unitsInStock = updatedProducts.reduce((sum, product) => 
        sum + (product.stock || 0), 0
      );
      
      setStats({
        ...stats,
        lowStock: lowStockItems,
        totalValue: totalValue,
        unitsInStock: unitsInStock
      });
      
      toast.success('Stock actualizado correctamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar el stock');
    } finally {
      setIsUpdating(false);
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Precio', 'Stock', 'Unidad', 'Descripción'];
    const csvRows = [];
    
    // Añadir encabezados
    csvRows.push(headers.join(','));
    
    // Añadir datos
    sortedProducts.forEach(product => {
      const row = [
        `"${product.name || ''}"`, 
        `"${product.category || ''}"`,
        product.price || 0,
        product.stock || 0,
        `"${product.unit || 'u.'}"`,
        `"${product.description || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    // Crear blob y descargar
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Inventario exportado correctamente');
  };

  return (
    <div className="inventory-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Encabezado y acciones principales */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Inventario</h2>
          <p className="text-muted small mb-0">Gestión de productos y stock</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setFilterActive(!filterActive)}
          >
            <FaFilter className="me-1" /> {filterActive ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
          
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={exportToCSV}
          >
            <FaDownload className="me-1" /> Exportar
          </button>
          
          <button 
            className="btn btn-outline-info btn-sm"
            onClick={loadProductsAndStats}
            disabled={loading}
          >
            <FaSyncAlt className={`me-1 ${loading ? 'fa-spin' : ''}`} /> Actualizar
          </button>
          
          <Link 
            to="/products/new" 
            className="btn btn-primary btn-sm"
          >
            <FaPlus className="me-1" /> Nuevo Producto
          </Link>
        </div>
      </div>
      
      {/* Panel de estadísticas */}
      <InventoryDashboard stats={stats} />
      
      {/* Filtros activos */}
      {filterActive && (
        <div className="filter-bar card p-3 mb-3">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <FaSearch size={12} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar por nombre o categoría"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">Todo el stock</option>
                <option value="low">Stock bajo</option>
                <option value="out">Sin stock</option>
                <option value="available">Disponible</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                  setSortBy('name');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabla compacta de productos */}
      <div className="card">
        <div className="card-body p-0">
          <InventoryTable 
            products={sortedProducts}
            loading={loading || isUpdating}
            error={error}
            onSortChange={setSortBy}
            onStockUpdate={handleUpdateStock}
          />
        </div>
      </div>
      
      {/* Leyenda para colores de stock */}
      <div className="mt-3 small">
        <div className="d-flex align-items-center mb-2">
          <div className="bg-danger me-2" style={{width: '12px', height: '12px', borderRadius: '50%'}}></div>
          <span className="text-secondary">Sin stock</span>
        </div>
        <div className="d-flex align-items-center">
          <div className="bg-warning me-2" style={{width: '12px', height: '12px', borderRadius: '50%'}}></div>
          <span className="text-secondary">Stock bajo (menos de 10 unidades)</span>
        </div>
      </div>
      
      {/* Resumen de productos filtrados */}
      {filterActive && (
        <div className="mt-3 text-end text-muted small">
          <span>Mostrando {sortedProducts.length} de {products.length} productos</span>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
