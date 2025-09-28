import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {currentYear} Revize - Aplikace pro správu revizí zdvihacích zařízení</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white">
              Zásady ochrany osobních údajů
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Podmínky použití
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Kontakt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
