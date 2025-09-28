import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Přidání event listeneru pro klávesové zkratky
    window.addEventListener('keydown', handleEsc);

    // Zabránění scrollování na pozadí
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Kliknutí mimo modální okno
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Zavřít</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;