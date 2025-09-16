import { Book, GoogleBooksApiResponse, GoogleBookItem } from "../types";

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

const transformGoogleBookItem = (item: GoogleBookItem): Book => {
  const volumeInfo = item.volumeInfo;
  let isbn13 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === "ISBN_13"
  )?.identifier;
  if (!isbn13) {
    isbn13 = volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_10"
    )?.identifier;
  }

  return {
    id: item.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors,
    description: volumeInfo.description,
    thumbnail:
      volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
    isbn: isbn13,
    publishedDate: volumeInfo.publishedDate,
    publisher: volumeInfo.publisher,
    pageCount: volumeInfo.pageCount,
    infoLink: volumeInfo.infoLink,
    categories: volumeInfo.categories,
  };
};

export const searchBookByTitleAuthor = async (
  title: string,
  author: string
): Promise<Book[] | null> => {
  // Prioritize exact matches for title and author
  const query = `intitle:${encodeURIComponent(
    title
  )}+inauthor:${encodeURIComponent(author)}`;
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=5`
    ); // Fetch a few results
    if (!response.ok) {
      console.error(`Google Books API error: ${response.status}`);
      return null;
    }
    const data: GoogleBooksApiResponse = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items.map(transformGoogleBookItem);
    }

    // Fallback if specific title+author yields no results, try a more general query
    return searchBookByPartialInfo(`${title} ${author}`);
  } catch (error) {
    console.error("Error fetching from Google Books API:", error);
    return null;
  }
};

export const searchBookByPartialInfo = async (
  searchTerm: string
): Promise<Book[] | null> => {
  const query = encodeURIComponent(searchTerm);
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=5`
    );
    if (!response.ok) {
      console.error(
        `Google Books API error (partial search): ${response.status}`
      );
      return null;
    }
    const data: GoogleBooksApiResponse = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items.map(transformGoogleBookItem);
    }
    return null;
  } catch (error) {
    console.error(
      "Error fetching from Google Books API (partial search):",
      error
    );
    return null;
  }
};
