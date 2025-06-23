import React, { useState } from "react";
import axios from "axios";

const Scraper = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!url) return alert("Please enter a URL");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/scrape", { url });
      setData(res.data.data);
    } catch (err) {
      alert("Scrape failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600"
          placeholder="Enter URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleScrape}
          className="sm:flex flex-col bg-black text-white px-4 py-3 rounded"
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* TEXT CONTENT */}
          <div>
            <h2 className="text-xl font-semibold mb-2 border-b border-gray-600 pb-1">📝 Page Text</h2>
            <div className="prose prose-invert max-w-none">
              {data.text.split("\n").map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </div>
          </div>

          {/* IMAGES */}
          {data.images?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 border-b border-gray-600 pb-1">🖼 Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.startsWith("http") ? img : url + img}
                    alt={`img-${i}`}
                    className="rounded border border-gray-700 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scraper;
