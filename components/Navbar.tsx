
import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const navItemClasses = (view: AppView) => 
    `px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out
     ${currentView === view 
       ? 'bg-indigo-600 text-white shadow-lg' 
       : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <i className="fas fa-book-open text-3xl text-indigo-400 mr-3"></i>
            <span className="font-bold text-2xl text-white">Book Scout</span>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <button 
              onClick={() => setCurrentView('identify')}
              className={navItemClasses('identify')}
            >
              <i className="fas fa-search mr-2 sm:mr-1"></i>
              <span className="hidden sm:inline">Identify Book</span>
              <span className="sm:hidden">Scan</span>
            </button>
            <button 
              onClick={() => setCurrentView('collection')}
              className={navItemClasses('collection')}
            >
              <i className="fas fa-layer-group mr-2 sm:mr-1"></i>
              <span className="hidden sm:inline">My Collection</span>
              <span className="sm:hidden">Books</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
