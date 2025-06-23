import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Scraper = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async (pageNum = 1) => {
    if (!search.trim()) {
      toast.error("Please enter a search keyword!");
      return;
    }

    setLoading(true);
    try {
      // Scrape and Save
      const scrapeRes = await axios.get(`http://localhost:3000/search?q=${search}`);
      toast.success(scrapeRes.data.message || "Scraping completed");

      // Fetch Paginated Data
      const res = await axios.get(`http://localhost:3000/products?q=${search}&page=${pageNum}&limit=10`);

      setProducts(res.data.products);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);

      if (res.data.products.length === 0) {
        toast("No products found.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen p-6 md:p-10">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-purple-500 mb-8">🛍️ Amazon Scraper</h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <input
          type="text"
          className="px-4 py-3 w-full max-w-md rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Search for Toys, Laptops, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => handleSearch(1)}
          className="bg-purple-600 px-6 py-3 rounded hover:bg-purple-700 transition duration-200"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-48 w-full object-contain bg-white p-2"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-sm text-gray-300 h-12 overflow-hidden">{product.description}</p>
              <p className="text-purple-400 font-semibold mt-3 text-lg">{product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => handleSearch(page - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleSearch(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                i + 1 === page
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => handleSearch(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Scraper;
