import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Aplikace pro správu revizí zdvihacích zařízení</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary">Zákazníci</h2>
          <p className="text-gray-600 mb-6">Správa firem a jejich kontaktních údajů, přehled zařízení a historií revizí.</p>
          <Link 
            to="/customers" 
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Přejít na zákazníky
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary">Zařízení</h2>
          <p className="text-gray-600 mb-6">Evidence zdvihacích zařízení, jejich technických parametrů a historie revizí.</p>
          <Link 
            to="/equipment" 
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Přejít na zařízení
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary">Revize</h2>
          <p className="text-gray-600 mb-6">Vytváření a správa revizních protokolů s možností generování PDF dokumentů.</p>
          <Link 
            to="/revisions" 
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Přejít na revize
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary">Servisní výjezdy</h2>
          <p className="text-gray-600 mb-6">Evidence provedených servisních prací, použitých dílů a fakturace.</p>
          <Link 
            to="/services" 
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Přejít na servis
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-primary">Inspekce</h2>
          <p className="text-gray-600 mb-6">Evidence pravidelných inspekcí, zjištěných nedostatků a doporučení.</p>
          <Link 
            to="/inspections" 
            className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Přejít na inspekce
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
