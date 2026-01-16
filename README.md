# 📚 Book Scout

**Book Scout** is a **React + TypeScript** web application designed to help users search, display, and manage their book collections. The project is powered by **Vite** for fast performance and a modern development experience.

## 🚀 Features
- Display book details with a clean and simple interface.  
- Manage personal book collections.  
- Upload and preview book cover images.  
- Intuitive navigation with a custom `Navbar` component.  
- Animated loading states for better user experience.  

## 🛠️ Built With
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)  
- [Vite](https://vitejs.dev/)  
- [Node.js](https://nodejs.org/) & npm/yarn  
- Custom components (`BookDisplay`, `CollectionDisplay`, `ImageInput`, etc.)  

## 📂 Project Structure
```

Book-Scout/
├── components/          # UI Components
│   ├── BookDisplay.tsx
│   ├── CollectionDisplay.tsx
│   ├── ImageInput.tsx
│   ├── LoadingIcon.tsx
│   └── Navbar.tsx
├── App.tsx              # Application root
├── index.html           # HTML entry point
├── index.tsx            # React entry point
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── .env                 # API configuration
└── README.md            # Documentation

````

## 📦 Installation & Usage
Make sure you have **Node.js** (v16 or higher) installed.

```bash
# Clone the repository
git clone https://github.com/username/Book-Scout.git
cd Book-Scout

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
````

## ⚙️ Configuration

Some environment variables can be set in the `.env.local` file (e.g., API keys or custom configuration).
Make sure to create and adjust this file before running the app.

## 📜 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute it as needed.
