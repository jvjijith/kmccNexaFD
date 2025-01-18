import React from 'react';
import ReactDOM from 'react-dom';

const PopUpModal = ({ isOpen, onClose, title, children, size }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 primary opacity-100" onClick={onClose}></div>

      {/* Modal Content */}
      <div
        className={`primary rounded-lg bg-secondary-card overflow-hidden shadow-xl transform transition-all ${
          size
            ? "sm:max-w-4xl sm:w-full h-full p-8"
            : "sm:max-w-lg sm:w-full p-6"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-color">{title}</h2>
          <button onClick={onClose} className="text-text-color text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className={`${size ? "overflow-y-auto h-[calc(100%-64px)]" : ""}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PopUpModal;
