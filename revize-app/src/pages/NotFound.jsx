import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-8">Stránka nenalezena</p>
      <p className="text-gray-500 mb-6">Omlouváme se, ale stránka, kterou hledáte, neexistuje.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800 transition-colors"
      >
        Zpět na domovskou stránku
      </Link>
    </div>
  );
};

export default NotFound;
