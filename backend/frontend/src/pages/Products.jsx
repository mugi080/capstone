import React, { useEffect, useState } from "react";
import { getBeverages, getCategories } from "../api/Products";

function Products() {
  const [beverages, setBeverages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [beveragesData, categoriesData] = await Promise.all([
          getBeverages(),
          getCategories(),
        ]);

        if (isMounted) {
          setBeverages(beveragesData);
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) setError("Failed to load products.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBeverages = selectedCategory
    ? beverages.filter((bev) => bev.category?.id === parseInt(selectedCategory))
    : beverages;

  return (
    <div>
      <h1>Product List</h1>

      {loading && <p>Loading beverages...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Category Filter */}
      <div>
        <label htmlFor="category-select">Filter by Category:</label>
        <select
          id="category-select"
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <div>
        {filteredBeverages.length > 0 ? (
          filteredBeverages.map((bev) => (
            <div key={bev.id}>
              {bev.image && (
                <img
                  src={`http://127.0.0.1:8000${bev.image}`}
                  alt={bev.name}
                  width="150"
                  height="150"
                />
              )}
              <p><strong>{bev.name}</strong></p>
              <p>{bev.volume}ml</p>
              <p>Php {bev.price}</p>
              <p>Stock: {bev.stock}</p>
              <p>{bev.is_available ? "Available ✅" : "Out of Stock ❌"}</p>
              <hr />
            </div>
          ))
        ) : (
          <p>No beverages found.</p>
        )}
      </div>
    </div>
  );
}

export default Products;
