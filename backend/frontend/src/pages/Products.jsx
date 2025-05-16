import React, { useEffect, useState } from "react";
import { getBeverages, getCategories } from "../api/Products";
import { Link } from "react-router-dom";
import "./css/Products.css"; // Import CSS file

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
    <div className="products-container">
      {loading && <p>Loading beverages...</p>}
      {error && <p className="error">{error}</p>}

      {/* Filter */}
      <div className="filter-container">
        <label htmlFor="category-select">Filter by Category:</label>
        <select
          id="category-select"
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredBeverages.length > 0 ? (
          filteredBeverages.map((bev) => (
            <Link to={`/product-detail/${bev.id}`} key={bev.id} className="product-card">
              {bev.image && (
                <div className="image-wrapper">
                  <img src={`http://127.0.0.1:8000${bev.image}`} alt={bev.name} />
                </div>
              )}
              <h2>{bev.name}</h2>
              <div className="product-info">
                <p>{bev.volume}ml</p>
                <p className="price">Php {bev.price}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-products">No beverages found.</p>
        )}
      </div>
    </div>
  );
}

export default Products;
