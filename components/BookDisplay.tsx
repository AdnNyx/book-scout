
import React from 'react';
import { Book } from '../types';

interface BookDisplayProps {
  book: Book;
  onAddToCollection: (book: Book) => void;
  onShare: (book: Book) => void;
  isInCollection: boolean;
}

const PlaceholderIcon: React.FC<{className?: string}> = ({className}) => (
  <div className={`flex items-center justify-center bg-slate-700 text-slate-500 rounded ${className}`}>
    <i className="fas fa-book fa-3x"></i>
  </div>
);


export const BookDisplay: React.FC<BookDisplayProps> = ({ book, onAddToCollection, onShare, isInCollection }) => {
  return (
    <div className="mt-6 p-6 bg-slate-800 rounded-xl shadow-2xl animate-fadeIn">
      <h3 className="text-3xl font-bold mb-6 text-center text-indigo-300">{book.title}</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex-shrink-0">
          {book.thumbnail ? (
            <img 
              src={book.thumbnail} 
              alt={`Cover of ${book.title}`} 
              className="w-full h-auto object-contain rounded-lg shadow-lg mx-auto max-h-96" 
            />
          ) : (
            <PlaceholderIcon className="w-full h-96"/>
          )}
        </div>
        <div className="md:w-2/3 space-y-3 text-slate-300">
          <p><strong>Author(s):</strong> {book.authors?.join(', ') || 'N/A'}</p>
          <p><strong>Published Date:</strong> {book.publishedDate || 'N/A'}</p>
          <p><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
          <p><strong>Pages:</strong> {book.pageCount || 'N/A'}</p>
          {book.categories && book.categories.length > 0 && (
            <p><strong>Categories:</strong> {book.categories.join(', ')}</p>
          )}
          {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
          <div className="prose prose-sm prose-invert max-w-none text-slate-300">
            <p className="font-semibold text-indigo-300">Synopsis:</p>
            {book.description ? (
              <p className="line-clamp-6 hover:line-clamp-none transition-all duration-300 ease-in-out">{book.description}</p>
            ) : <p>No synopsis available.</p>}
          </div>
          {book.infoLink && (
            <a 
              href={book.infoLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              More Info on Google Books <i className="fas fa-external-link-alt text-xs ml-1"></i>
            </a>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          onClick={() => onAddToCollection(book)}
          disabled={isInCollection}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-150 flex items-center justify-center gap-2 ${
            isInCollection 
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
          }`}
        >
          <i className={`fas ${isInCollection ? 'fa-check-circle' : 'fa-bookmark'}`}></i> 
          {isInCollection ? 'In Collection' : 'Save to Collection'}
        </button>
        <button 
          onClick={() => onShare(book)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <i className="fas fa-share-alt"></i> Share
        </button>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeInAnimation 0.5s ease-in-out; }
        @keyframes fadeInAnimation { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .hover\\:line-clamp-none:hover {
          -webkit-line-clamp: unset;
        }
      `}</style>
    </div>
  );
};
