import React, { useEffect, useState } from "react";
import { getBeverageById } from "../api/Products";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetails.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productData = await getBeverageById(id);
        setProduct(productData);
      } catch (err) {
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleBuyNow = () => {
    navigate("/shop_now", { state: { productToBuy: product } });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <h1>{product.name}</h1>

      </div>

      <div className="product-detail-body">
        <div className="product-image">
          <img
            src={`http://127.0.0.1:8000${product.image}`}
            alt={product.name}
            className="product-image-img"
          />
        </div>

        <div className="product-info">
          <p className="category">
            <strong>Category:</strong> {product.category.name}
          </p>
          <p className="volume">
            <strong>Volume:</strong> {product.volume} ml
          </p>
          <p className="price">
            <strong>Price:</strong> Php {product.price}
          </p>
          <p className="stock">
            <strong>Stock:</strong> {product.stock}
          </p>
          <p className="availability">
            <strong>Availability:</strong>{" "}
            {product.is_available ? "In Stock ✅" : "Out of Stock ❌"}
          </p>

          <div className="cta-buttons">
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ProductDetail;
