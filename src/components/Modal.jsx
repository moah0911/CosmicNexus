import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-black border border-purple-800 w-full max-w-md m-auto rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-200">{title}</h3>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-200"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
