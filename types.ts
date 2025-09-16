
export interface Book {
  id: string; // From Google Books API
  title: string;
  authors?: string[];
  description?: string;
  thumbnail?: string; // Cover image URL
  isbn?: string; 
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  infoLink?: string; // Link to Google Books page
  categories?: string[];
}

export interface IdentifiedBookInfo {
  title: string;
  author: string;
}

// Simplified from Google Books API
export interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  pageCount?: number;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  infoLink?: string;
  categories?: string[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBooksApiResponse {
  items?: GoogleBookItem[];
  totalItems: number;
}

export type AppView = 'identify' | 'collection';
