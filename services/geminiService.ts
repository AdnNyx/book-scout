import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { IdentifiedBookInfo } from "../types";

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const DEFAULT_PROMPT = `Analyze this book cover image. Extract the book's title and primary author. 
Respond with ONLY the title and author in the format:
Title: [Detected Title]
Author: [Detected Author]
If you cannot confidently identify both, respond with 'Unable to identify book details from cover.'`;

export const identifyBookFromImage = async (
  ai: GoogleGenAI,
  base64ImageData: string,
  promptText: string = DEFAULT_PROMPT
): Promise<string> => {
  const imageMimeType = base64ImageData.substring(
    base64ImageData.indexOf(":") + 1,
    base64ImageData.indexOf(";")
  );
  const actualBase64Data = base64ImageData.substring(
    base64ImageData.indexOf(",") + 1
  );

  const imagePart: Part = {
    inlineData: {
      mimeType: imageMimeType,
      data: actualBase64Data,
    },
  };

  const textPart: Part = {
    text: promptText,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      // Optional: Add thinkingConfig if needed, for now default is fine.
      // config: { thinkingConfig: { thinkingBudget: 0 } } // for low latency if required
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      // More specific error handling could be added here based on Gemini API error types
      if (error.message.includes("API key not valid")) {
        throw new Error("Invalid API Key. Please check your configuration.");
      }
    }
    throw new Error("Failed to get response from AI model.");
  }
};

export const parseGeminiBookResponse = (
  responseText: string
): IdentifiedBookInfo | null => {
  if (
    !responseText ||
    responseText.toLowerCase().includes("unable to identify")
  ) {
    return null;
  }

  // Regex to capture Title and Author, case-insensitive for keys, flexible spacing
  const titleMatch = responseText.match(/Title:\s*(.*)/i);
  const authorMatch = responseText.match(/Author:\s*(.*)/i);

  let title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : null;
  let author = authorMatch && authorMatch[1] ? authorMatch[1].trim() : null;

  // If title line also contains Author (e.g. "Title: Book Name Author: Author Name")
  if (title && !author) {
    const authorInTitleMatch = title.match(/(.*)Author:\s*(.*)/i);
    if (authorInTitleMatch && authorInTitleMatch[1] && authorInTitleMatch[2]) {
      title = authorInTitleMatch[1].trim();
      author = authorInTitleMatch[2].trim();
    }
  }

  // If author line also contains Title
  if (author && !title) {
    const titleInAuthorMatch = author.match(/(.*)Title:\s*(.*)/i);
    if (titleInAuthorMatch && titleInAuthorMatch[1] && titleInAuthorMatch[2]) {
      author = titleInAuthorMatch[1].trim();
      title = titleInAuthorMatch[2].trim();
    }
  }

  // Fallback: If strict "Title:" "Author:" format is not found,
  // try to find lines that seem like title and author. This is less reliable.
  if (!title || !author) {
    const lines = responseText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length >= 1 && !title) {
      // Assume first non-empty line could be title
      title = lines[0];
    }
    if (lines.length >= 2 && !author) {
      // Assume second non-empty line could be author
      // Check if the assumed title line contains 'by' or author-like keyword
      const byMatch = lines[0].match(/(.*)\s+by\s+(.*)/i);
      if (byMatch && byMatch[1] && byMatch[2]) {
        title = byMatch[1].trim();
        author = byMatch[2].trim();
      } else {
        author = lines[1];
      }
    }
  }

  // Final cleanup, remove any trailing "Author:" or "Title:" from the values themselves
  if (title && title.toLowerCase().startsWith("author:"))
    title = title.substring(7).trim();
  if (author && author.toLowerCase().startsWith("title:"))
    author = author.substring(6).trim();

  if (title && author) {
    return {
      title: title.replace(/[,.]$/, ""), // Remove trailing comma or period
      author: author.replace(/[,.]$/, ""),
    };
  }

  // If only title is found and it might contain author information
  if (title && !author) {
    const commonSeparators = [" by ", " - ", " – "]; // en-dash
    for (const sep of commonSeparators) {
      if (title.includes(sep)) {
        const parts = title.split(sep);
        if (parts.length >= 2) {
          return {
            title: parts[0].trim(),
            author: parts.slice(1).join(sep).trim(),
          };
        }
      }
    }
  }

  console.warn(
    "Could not parse Gemini response into title/author:",
    responseText
  );
  return null;
};
