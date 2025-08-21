import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../../services/productService";
import "../../../assets/scss/product-details.scss";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product", err.message);
      }
    })();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-detail-card">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="details">
          <h2>{product.name}</h2>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Story:</strong> {product.story}</p>
          <p><strong>How to Use:</strong></p>
          <ul>{(product.howToUse || []).map((step, i) => <li key={i}>{step}</li>)}</ul>

          <p><strong>Benefits:</strong></p>
          <ul>{(product.benefits || []).map((b, i) => <li key={i}>{b}</li>)}</ul>

          <p><strong>Nutrition (per 100g):</strong></p>
          <ul>
            {(product.nutrition || []).map((nutrient, i) => (
              <li key={i}>{nutrient.name}: {nutrient.value}</li>
            ))}
          </ul>

          <p><strong>Nutrition Note:</strong> {product.nutritionNote}</p>

          {/* <p><strong>Quantity:</strong> {product.quantity} pcs</p> */}
          <p><strong>Shipping Fee:</strong> ₹{product.shippingFee}</p>

          {/* --- Variant Dropdown and Price --- */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="variant-row" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
              <select
                value={selectedVariant}
                onChange={e => setSelectedVariant(Number(e.target.value))}
                style={{ minWidth: 80, padding: "4px 8px" }}
              >
                {product.sizes.map((variant, idx) => (
                  <option key={idx} value={idx}>
                    {variant.sizeLabel}
                  </option>
                ))}
              </select>
              <h5 style={{ margin: 0, color: "#28a745" }}>
                ₹{product.sizes[selectedVariant] ? parseFloat(product.sizes[selectedVariant].price) : "N/A"}
              </h5>
            </div>
          )}

          <p>
            <strong>Stocks:</strong>{" "}
            {product.sizes && product.sizes[selectedVariant]
              ? product.sizes[selectedVariant].quantity
              : "N/A"} pcs
          </p>

          <h4>Customer Support</h4>
          <p><strong>Email:</strong> {product.customerSupport?.email}</p>
          <p><strong>Phone:</strong> {product.customerSupport?.phone}</p>
          <p><strong>WhatsApp:</strong> {product.customerSupport?.whatsapp}</p>
          <p><strong>Website:</strong> {product.customerSupport?.website}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;