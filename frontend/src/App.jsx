import React from "react";
import Scraper from "./compo/Scraper";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🌐 Web Scraper</h1>
      <Scraper />
    </div>
  );
}

export default App;
