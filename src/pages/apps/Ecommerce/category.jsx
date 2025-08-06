import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import "../../../assets/scss/product.scss";
import PageTitle from "../../../components/PageTitle";
import {
  getAllProducts,
  deleteProduct,
  addProduct,
  updateProduct,
  getTax,
  setTax,
  getShippingSettings,
  setShippingSettings,
  uploadProductImage, // Ensure this function is implemented
} from "../../../services/productService";

import {
    addCategory, // Ensure this function is implemented
    getCategory
  } from "../../../services/categoryService";

// ✅ Add truncate here before the component
const truncate = (text, limit = 40) =>
  text?.length > limit ? text.substring(0, limit) + "..." : text;

const Category = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [shippingFee, setShippingFee] = useState(""); // Shipping fee for each product
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // new state
  const [selectedProduct, setSelectedProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    image: "",
    shippingFee: "", // Add shipping fee for individual product
  });

  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [isTaxLoading, setIsTaxLoading] = useState(false);

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingSettings, setShippingSettingsState] = useState({
    enableOrderShipping: false,
    shippingCap: "",
    freeShippingAbove: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true); // Show loader
      const data = await getCategory();
      setProducts(data);
      setAllProducts(data);
    } catch (error) {
      console.error("Error loading products:", error.message);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const searchProduct = (value) => {
    if (!value) setProducts(allProducts);
    else setProducts(allProducts.filter((item) => item.name.toLowerCase().includes(value.toLowerCase())));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  const handleShowAddModal = () => {
    setEditMode(false);
    setSelectedProduct({ categoryName: "", image: "" });
    setImageFile(null);
    setShippingFee("");
    setShowModal(true);
  };

  const handleShowEditModal = (product) => {
    console.log('img---', product);
    setEditMode(true);
    setSelectedProduct(product);
    setImageFile(null);
    setShippingFee(product.shippingFee || "");
    setShowModal(true);
    setImagePreview(product.image || "");
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct({ ...selectedProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };


  const handleImageUpload = () => {
    if (imageFile) {
      // Implement the image upload logic to Firebase or other storage here
      console.log("Image selected:", imageFile);
    }
  };

  const handleSave = async () => {
    let imageBlob = null;
    try {
      let payload = { ...selectedProduct};
      const formData = new FormData();

      // ✅ Fix: Stringify payload before appending
      formData.append("payload", JSON.stringify(payload));

      if (imageFile instanceof Blob) {
        imageBlob = imageFile;
      } else if (typeof imageFile === "string" && imageFile.startsWith("data:image")) {
        imageBlob = base64ToBlob(imageFile, "image/png");
      } else if (typeof imageFile === "string" && imageFile.startsWith("blob:")) {
        const response = await fetch(imageFile);
        imageBlob = await response.blob();
      }

      if (imageBlob) {
        formData.append("categoryImage", imageBlob, "product.png"); // ✅ field name must match multer
      }

      if (editMode) {
        await updateProduct(selectedProduct.id, formData); // PUT with FormData
      } else {
        await addCategory(formData); // POST with FormData
      }

      handleCloseModal();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error.message);
    }
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Ecommerce", path: "/apps/ecommerce/products" },
          { label: "Products", path: "/apps/ecommerce", active: true },
        ]}
        title={"Products"}
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="justify-content-between">
                <Col className="col-auto">
                  <input
                    type="search"
                    className="form-control me-3"
                    placeholder="Search..."
                    onChange={(e) => searchProduct(e.target.value)}
                  />
                </Col>
                <Col className="col-auto text-lg-end">
                  <Button className="btn btn-danger me-2" onClick={handleShowAddModal}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add New
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {isLoading ? (
        <div className="dot-loader">
          <span></span><span></span><span></span>
        </div>

      ) : (
        <Row>
          {products.map((product, index) => (
            <Col key={index} md={6} xl={4} className="cardList">

              <Card className="product-box h-100" onClick={() => navigate(`/apps/ecommerce/product-details/${product.id}`)} style={{ cursor: "pointer" }}>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div className="product-action text-end">
                    {/* Action buttons */}
                  </div>

                  <div className="product-image mb-2 text-center">
                    <img src={product.image} alt={product.name} className="product-thumbnail" />
                  </div>

                  {/* <div className="product-info">
            <h5 className="product-name">{product.name}</h5>
            <p className="text-muted mb-1 small">Story: {truncate(product.story, 40)}</p>
            <p className="text-muted mb-1 small">How to use: {truncate(product.howToUse?.join(", "), 40)}</p>
            <p className="text-muted mb-1 small">Benefits: {truncate(product.benefits?.join(", "), 40)}</p>
            <p className="text-muted mb-1 small">Stocks: {product.quantity} pcs</p>
            <p className="text-muted mb-1 small">Shipping: ₹{product.shippingFee}</p>
            <h6 className="mt-2">₹{parseFloat(product.price) + calculateShipping(product)}</h6>
          </div> */}

                  <div className="product-info">
                    <h5 className="product-name" title={product.category}>{product.category}</h5>

                   
                  </div>

                  <div className="product-footer mt-auto pt-2 border-top">
                    <div className="product-actions">
                      <button
                        className="icon-btn edit-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowEditModal(product);
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn delete-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>


                  </div>
                </Card.Body>
              </Card>

            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* === Section 1: Product Basics === */}
            <div className="form-section">
              <h5 className="section-title">🧂 Category</h5>

              <Form.Group>
                <Form.Label>Category Name</Form.Label>
                <Form.Control type="text" name="category" value={selectedProduct.category} onChange={handleInputChange} />
              </Form.Group>

            </div>

            {/* === Section 4: Pricing & Logistics === */}
            <div className="form-section">

              <Form.Group>
                <Form.Label>Category Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    className="mt-2"
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                )}
              </Form.Group>

            </div>
          </Form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editMode ? "Update" : "Add"}
          </Button>

        </Modal.Footer>
      </Modal >


    </>
  );
};

export default Category;
