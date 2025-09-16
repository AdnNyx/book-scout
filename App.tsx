import React, { useState, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { ImageInput } from "./components/ImageInput";
import { BookDisplay } from "./components/BookDisplay";
import { CollectionDisplay } from "./components/CollectionDisplay";
import { LoadingIcon } from "./components/LoadingIcon";
import { Navbar } from "./components/Navbar";
import {
  identifyBookFromImage,
  parseGeminiBookResponse,
} from "./services/geminiService";
import {
  searchBookByTitleAuthor,
  searchBookByPartialInfo,
} from "./services/bookApiService";
import { Book, AppView, IdentifiedBookInfo } from "./types";

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("identify");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [identifiedBookInfo, setIdentifiedBookInfo] =
    useState<IdentifiedBookInfo | null>(null);
  const [detailedBook, setDetailedBook] = useState<Book | null>(null);
  const [collection, setCollection] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    // API Key is expected to be in process.env.API_KEY
    // For local development or environments where process.env is not directly available in client-side JS,
    // this would need to be handled, e.g. via a build process or a server endpoint.
    // For this exercise, we assume process.env.API_KEY is accessible.
    // In a real scenario, you'd secure this key.
    const key = process.env.API_KEY;
    if (key) {
      setApiKey(key);
    } else {
      setError(
        "API Key not found. Please ensure it's configured in your environment."
      );
      console.error("API Key not found.");
    }
  }, []);

  useEffect(() => {
    const storedCollection = localStorage.getItem("bookCollection");
    if (storedCollection) {
      setCollection(JSON.parse(storedCollection));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookCollection", JSON.stringify(collection));
  }, [collection]);

  const handleToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleImageSelect = async (imageBase64: string) => {
    if (!apiKey) {
      setError("API Key not available. Cannot process image.");
      setIsLoading(false);
      return;
    }
    setSelectedImage(imageBase64);
    setDetailedBook(null);
    setIdentifiedBookInfo(null);
    setError(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const rawGeminiResponse = await identifyBookFromImage(ai, imageBase64);
      const parsedInfo = parseGeminiBookResponse(rawGeminiResponse);

      if (parsedInfo) {
        setIdentifiedBookInfo(parsedInfo);
        const booksFromApi = await searchBookByTitleAuthor(
          parsedInfo.title,
          parsedInfo.author
        );
        if (booksFromApi && booksFromApi.length > 0) {
          setDetailedBook(booksFromApi[0]); // Take the first result
        } else {
          // Fallback: search with just title if author specific search fails
          const booksFromTitleSearch = await searchBookByPartialInfo(
            parsedInfo.title
          );
          if (booksFromTitleSearch && booksFromTitleSearch.length > 0) {
            setDetailedBook(booksFromTitleSearch[0]);
          } else {
            setError(
              "Book details not found in database, though Gemini identified: " +
                parsedInfo.title
            );
          }
        }
      } else {
        // Try a more general prompt if structured parsing fails
        const generalPrompt =
          "Describe the book cover image provided. What is the title and author? If you are unsure, say so.";
        const generalResponse = await identifyBookFromImage(
          ai,
          imageBase64,
          generalPrompt
        );
        const generalParsedInfo = parseGeminiBookResponse(generalResponse); // Attempt parsing again
        if (generalParsedInfo) {
          setIdentifiedBookInfo(generalParsedInfo);
          const booksFromApi = await searchBookByTitleAuthor(
            generalParsedInfo.title,
            generalParsedInfo.author
          );
          if (booksFromApi && booksFromApi.length > 0) {
            setDetailedBook(booksFromApi[0]);
          } else {
            setError(
              "Book details not found after general query. Gemini identified: " +
                generalParsedInfo.title
            );
          }
        } else {
          setError(
            "Could not identify book from cover. Gemini raw: " +
              (rawGeminiResponse || generalResponse || "No response")
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        `Error identifying book: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addToCollection = useCallback(
    (book: Book) => {
      if (!collection.find((b) => b.id === book.id)) {
        setCollection((prev) => [...prev, book]);
        handleToast(`${book.title} added to collection!`);
      } else {
        handleToast(`${book.title} is already in your collection.`);
      }
    },
    [collection]
  );

  const removeFromCollection = useCallback((bookId: string) => {
    setCollection((prev) => prev.filter((b) => b.id !== bookId));
    handleToast(`Book removed from collection.`);
  }, []);

  const clearCurrentIdentification = () => {
    setSelectedImage(null);
    setIdentifiedBookInfo(null);
    setDetailedBook(null);
    setError(null);
  };

  if (!apiKey && !error?.includes("API Key not found")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="text-center">
          <LoadingIcon />
          <p className="text-lg text-slate-300 mt-4">Initializing...</p>
        </div>
      </div>
    );
  }

  if (error?.includes("API Key not found")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-900 text-white">
        <div className="text-center p-8 bg-red-700 rounded-lg shadow-xl">
          <i className="fas fa-exclamation-triangle fa-3x text-yellow-300 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-lg">{error}</p>
          <p className="mt-4 text-sm">
            Please ensure the API_KEY environment variable is correctly set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {showToast && (
        <div className="fixed top-20 right-5 bg-green-500 text-white p-3 rounded-md shadow-lg z-50 animate-fadeInOut">
          {showToast}
        </div>
      )}

      <main className="flex-grow container mx-auto p-4 md:p-8">
        {currentView === "identify" && (
          <div className="space-y-6">
            <ImageInput
              onImageSelect={handleImageSelect}
              isLoading={isLoading}
            />
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-10 bg-slate-800 rounded-lg shadow-xl">
                <LoadingIcon />
                <p className="mt-4 text-lg text-indigo-300">
                  Scouting for your book...
                </p>
              </div>
            )}
            {error && !isLoading && (
              <div className="p-4 bg-red-500 text-white rounded-md shadow-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
                {selectedImage && (
                  <button
                    onClick={clearCurrentIdentification}
                    className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-800 rounded-md text-sm"
                  >
                    Try another image
                  </button>
                )}
              </div>
            )}
            {!isLoading && detailedBook && (
              <BookDisplay
                book={detailedBook}
                onAddToCollection={addToCollection}
                onShare={() => {
                  const shareText = `Check out this book: ${
                    detailedBook.title
                  } by ${detailedBook.authors?.join(", ")}. More info: ${
                    detailedBook.infoLink || "N/A"
                  }`;
                  navigator.clipboard
                    .writeText(shareText)
                    .then(() => handleToast("Book info copied to clipboard!"))
                    .catch((err) => handleToast("Failed to copy."));
                }}
                isInCollection={
                  !!collection.find((b) => b.id === detailedBook.id)
                }
              />
            )}
            {!isLoading && !detailedBook && identifiedBookInfo && !error && (
              <div className="p-6 bg-slate-700 rounded-lg shadow-xl text-center">
                <h3 className="text-xl font-semibold text-indigo-300">
                  Almost there...
                </h3>
                <p className="mt-2 text-slate-300">
                  Identified: "{identifiedBookInfo.title}" by{" "}
                  {identifiedBookInfo.author}.
                </p>
                <p className="mt-1 text-slate-400">
                  Could not fetch full details from the book database. The book
                  might be rare or the information slightly off.
                </p>
                {selectedImage && (
                  <button
                    onClick={clearCurrentIdentification}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                  >
                    Try another image
                  </button>
                )}
              </div>
            )}
            {!isLoading &&
              !detailedBook &&
              !identifiedBookInfo &&
              selectedImage &&
              !error && (
                <div className="p-6 bg-slate-700 rounded-lg shadow-xl text-center">
                  <p className="text-slate-300">
                    No book identified from this image, or detailed information
                    could not be retrieved.
                  </p>
                  <button
                    onClick={clearCurrentIdentification}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                  >
                    Try another image
                  </button>
                </div>
              )}
          </div>
        )}
        {currentView === "collection" && (
          <CollectionDisplay
            collection={collection}
            onRemoveFromCollection={removeFromCollection}
          />
        )}
      </main>
      <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-700">
        Book Scout &copy; {new Date().getFullYear()}. Mahfudin Adnan.
      </footer>
      <style>{`
        .animate-fadeInOut {
          animation: fadeInOutAnimation 3s ease-in-out;
        }
        @keyframes fadeInOutAnimation {
          0% { opacity: 0; transform: translateY(-20px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default App;
