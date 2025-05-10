import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ToastNotification = ({ type = 'info', message, autoClose = true, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-success" />;
      case 'error':
        return <FaTimesCircle className="text-danger" />;
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />;
      default:
        return <FaInfoCircle className="text-primary" />;
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`toast show ${type}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
        <div className="me-2">{getIcon()}</div>
        <strong className="me-auto">
          {type === 'success' && 'Éxito'}
          {type === 'error' && 'Error'}
          {type === 'warning' && 'Advertencia'}
          {type === 'info' && 'Información'}
        </strong>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default ToastNotification;
