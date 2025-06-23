import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe("pk_test_51RbxO2RA6d6y3GOGZxmrAcVlgVygSIEqpGUKcvZsEYfIeX0c6OL7igBAPhaSqSDURMmonjvI79sEaVVX8JKLBe0o00XUsrTjD7");

const Scraper = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [purchasedIds, setPurchasedIds] = useState([]);

  const handleSearch = async (pageNum = 1) => {
    if (!search.trim()) {
      toast.error("Please enter a search keyword!");
      return;
    }

    setLoading(true);
    try {
      const scrapeRes = await axios.get(`http://localhost:3000/search?q=${search}`);
      toast.success(scrapeRes.data.message || "Scraping completed");
      const res = await axios.get(`http://localhost:3000/products?q=${search}&page=${pageNum}&limit=10`);
      const productsWithId = res.data.products.map((p, idx) => ({
        ...p,
        _id: p._id || `${p.name}-${idx}`,
      }));
      setProducts(productsWithId);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);

      if (productsWithId.length === 0) toast("No products found.");
      setPurchasedIds([]);
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
    setLoading(false);
  };

  const handlePurchase = async (product) => {
    try {
      const res = await axios.post("http://localhost:3000/create-payment-intent", {
        amount: product.price,
      });

      setClientSecret(res.data.clientSecret);
      setSelectedProduct(product);
    } catch (err) {
      toast.error("Payment initialization failed");
    }
  };
  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 md:p-10">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-purple-500 mb-8">🛍️ Amazon Scraper</h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        <input
          type="text"
          className="px-4 py-3 w-full max-w-md rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Search for Toys, Laptops, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(1);
            }
          }}
        />
        <button
          onClick={() => handleSearch(1)}
          className="bg-purple-600 px-6 py-3 rounded hover:bg-purple-700 transition duration-200"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <div
            key={product._id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 flex flex-col h-full"
          >

            <img
              src={product.image}
              alt={product.name}
              className="h-48 w-full object-contain bg-white p-2"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-bold mb-2 line-clamp-2">{product.name}</h2>
              <p className="text-sm text-gray-300 flex-grow line-clamp-3">{product.description}</p>
              <p className="text-purple-400 font-semibold mt-3 text-lg">{product.price}</p>

              {purchasedIds.includes(product._id) ? (
                <button
                  disabled
                  className="mt-3 bg-gray-500 text-white px-4 py-2 rounded cursor-not-allowed"
                >
                  Purchased
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(product)}
                  className="mt-3 bg-purple-400 text-white px-4 py-2 rounded"
                >
                  Purchase
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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
              className={`px-3 py-1 rounded text-sm ${i + 1 === page
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
      {clientSecret && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[90%] max-w-4xl relative flex flex-col md:flex-row gap-6">
            <div className="flex-1 border rounded-lg p-4 text-center shadow">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full max-w-xs mx-auto h-48 object-contain mb-4"
              />
              <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
              <p className="text-2xl font-bold text-gray-700 mt-2">{selectedProduct.price}</p>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Complete your payment</h2>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    setPurchasedIds((prev) => [...prev, selectedProduct._id]);
                    setClientSecret("");
                    setSelectedProduct(null);
                  }}
                />
              </Elements>
            </div>
            <button
              onClick={() => {
                setClientSecret("");
                setSelectedProduct(null);
              }}
              className="absolute top-3 right-3 text-red-500 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>

  );
};

export default Scraper;
