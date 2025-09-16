
import React from 'react';
import { Book } from '../types';

interface CollectionDisplayProps {
  collection: Book[];
  onRemoveFromCollection: (bookId: string) => void;
}

const PlaceholderIcon: React.FC<{className?: string}> = ({className}) => (
  <div className={`flex items-center justify-center bg-slate-600 text-slate-400 rounded-md ${className}`}>
    <i className="fas fa-book fa-2x"></i>
  </div>
);

export const CollectionDisplay: React.FC<CollectionDisplayProps> = ({ collection, onRemoveFromCollection }) => {
  if (collection.length === 0) {
    return (
      <div className="text-center p-10 bg-slate-800 rounded-xl shadow-xl">
        <i className="fas fa-book-reader fa-3x text-indigo-400 mb-4"></i>
        <h2 className="text-2xl font-semibold text-indigo-300 mb-2">Your Collection is Empty</h2>
        <p className="text-slate-400">Start identifying books to add them here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-indigo-300 mb-8">My Book Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collection.map(book => (
          <div key={book.id} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
            {book.thumbnail ? (
              <img 
                src={book.thumbnail} 
                alt={`Cover of ${book.title}`} 
                className="w-full h-64 object-cover" 
              />
            ) : (
              <PlaceholderIcon className="w-full h-64" />
            )}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold text-indigo-300 mb-1 truncate" title={book.title}>{book.title}</h3>
              <p className="text-sm text-slate-400 mb-3 truncate">{book.authors?.join(', ') || 'Unknown Author'}</p>
              <p className="text-xs text-slate-500 flex-grow mb-3 line-clamp-3">
                {book.description || 'No description available.'}
              </p>
              <div className="mt-auto flex space-x-2">
                {book.infoLink && (
                  <a 
                    href={book.infoLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-150"
                  >
                    Details
                  </a>
                )}
                <button 
                  onClick={() => onRemoveFromCollection(book.id)}
                  className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-md transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
       <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
