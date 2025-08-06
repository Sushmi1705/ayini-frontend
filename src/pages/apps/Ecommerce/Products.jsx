import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import "../../../assets/scss/product.scss";
import PageTitle from "../../../components/PageTitle";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FaTrashAlt } from 'react-icons/fa'; // Using react-icons for trash icon
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

// ✅ Add truncate here before the component
const truncate = (text, limit = 40) =>
  text?.length > limit ? text.substring(0, limit) + "..." : text;

const Products = () => {
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
  const [sizes, setSizes] = useState([
    { id: 1, sizeLabel: "1kg", price: "", quantity: "", isActive: true },
  ]);

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
    loadShippingSettings();
  }, []);

  const handleSizeChange = (id, field, value) => {
    setSizes((prevSizes) =>
      prevSizes.map((size) =>
        size.id === id ? { ...size, [field]: value } : size
      )
    );
  };

  const addSize = () => {
    const newId = sizes.length ? sizes[sizes.length - 1].id + 1 : 1;
    setSizes([...sizes, { id: newId, sizeLabel: "", price: "", quantity: "", isActive: true }]);
  };

  const removeSize = (id) => {
    setSizes(sizes.filter((size) => size.id !== id));
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true); // Show loader
      const data = await getAllProducts();
      setProducts(data);
      setAllProducts(data);
    } catch (error) {
      console.error("Error loading products:", error.message);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const loadShippingSettings = async () => {
    try {
      const settings = await getShippingSettings();
      setShippingSettingsState(settings);
    } catch (error) {
      console.error("Error loading shipping settings:", error.message);
    }
  };

  const handleSaveShippingSettings = async () => {
    try {
      await setShippingSettings(shippingSettings);
      alert("Shipping settings updated successfully");
      setShowShippingModal(false);
    } catch (error) {
      console.error("Error saving shipping settings:", error.message);
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
    setSelectedProduct({ name: "", price: "", quantity: "", category: "", image: "", shippingFee: "" });
    setImageFile(null);
    setShippingFee("");
    setShowModal(true);
    setSizes([{ id: 1, sizeLabel: "", price: "", quantity: "", isActive: true }]);
  };

  const handleShowEditModal = (product) => {
    console.log('img---', product);
    setEditMode(true);
    setSelectedProduct(product);
    setImageFile(null);
    setShippingFee(product.shippingFee || "");
    setShowModal(true);
    setImagePreview(product.image || "");

    // Load sizes from product or fallback to default
  if (product.sizes && product.sizes.length > 0) {
    setSizes(product.sizes);
  } else {
    setSizes([{ id: 1, sizeLabel: "", price: "", quantity: "", isActive: true }]);
  }

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
      let payload = { ...selectedProduct, shippingFee, sizes };
      const formData = new FormData();

      console.log('176--------',payload);
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
        formData.append("productImage", imageBlob, "product.png"); // ✅ field name must match multer
      }

      if (editMode) {
        await updateProduct(selectedProduct.id, formData); // PUT with FormData
      } else {
        await addProduct(formData); // POST with FormData
      }

      handleCloseModal();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error.message);
    }
  };


  const handleShowTaxModal = async () => {
    try {
      setIsTaxLoading(true);
      const taxRateData = await getTax();
      setTaxRate(taxRateData.value || "");
      setShowTaxModal(true);
    } catch (error) {
      console.error("Error loading tax rate:", error.message);
    } finally {
      setIsTaxLoading(false);
    }
  };

  const handleSaveTax = async () => {
    if (!taxRate || isNaN(Number(taxRate))) return alert("Please enter valid tax");
    try {
      await setTax(taxRate);
      setShowTaxModal(false);
      alert("Tax rate updated successfully");
    } catch (error) {
      console.error("Error saving tax rate:", error.message);
    }
  };

  // Calculate shipping fee based on order-level shipping rules
  const calculateShipping = (product) => {
    let totalShippingFee = parseFloat(product.shippingFee || 0);
    if (shippingSettings.enableOrderShipping) {
      let orderTotal = products.reduce((acc, prod) => acc + parseFloat(prod.price), 0);
      if (orderTotal >= parseFloat(shippingSettings.freeShippingAbove)) {
        totalShippingFee = 0;
      } else if (parseFloat(shippingSettings.shippingCap) && totalShippingFee > parseFloat(shippingSettings.shippingCap)) {
        totalShippingFee = parseFloat(shippingSettings.shippingCap);
      }
    }
    return totalShippingFee;
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
                  <Button className="btn btn-warning me-2" onClick={handleShowTaxModal}>
                    Tax
                  </Button>
                  <Button className="btn btn-info" onClick={() => setShowShippingModal(true)}>
                    Shipping Settings
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
              {/* <div className="product-actions">
                    <button className="edit-btn" onClick={() => handleShowEditModal(product)}>✏️ Edit</button>
                    <button className="delete-btn" onClick={handleDelete}>🗑️ Delete</button>
                    </div> */}
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
                    <h5 className="product-name" title={product.name}>{product.name}</h5>

                    {/* Story */}
                    <div className="info-block">
                      <div className="info-title">📖 Story</div>
                      <div className="info-text text-muted small" title={product.story}>
                        {product.story?.split('\n').map((line, index) => (
                          <div key={index}>{truncate(line, 60)}</div>
                        ))}
                      </div>

                    </div>

                    {/* How to use */}
                    <div className="info-block">
                      <div className="info-title">📝 How to Use</div>
                      <div className="info-text text-muted small" title={product.howToUse?.join('\n')}>
                        {product.howToUse?.slice(0, 2).map((step, index) => (
                          <div key={index}>• {step}</div>
                        ))}
                        {product.howToUse?.length > 2 && <div>...</div>}
                      </div>

                    </div>

                    {/* Benefits */}
                    <div className="info-block">
                      <div className="info-title">🌿 Benefits</div>
                      <div className="info-text text-muted small" title={product.benefits?.join('\n')}>
                        {product.benefits?.slice(0, 2).map((item, i) => (
                          <div key={i}>{item}</div>
                        ))}
                        {product.benefits?.length > 2 && <div>...</div>}
                      </div>

                    </div>

                    {/* Basic Info */}
                    <p className="text-muted mb-1 small">
                      <strong>Stocks:</strong> {product.quantity} pcs
                    </p>
                    <p className="text-muted mb-1 small">
                      <strong>Shipping:</strong> ₹{product.shippingFee}
                    </p>

                    <h6 className="mt-2">
                      ₹{parseFloat(product.price) + calculateShipping(product)}
                    </h6>
                  </div>

                  <div className="product-footer mt-auto pt-2 border-top">
                    <p className="small text-muted mb-1">Support: {product.customerSupport?.phone}</p>
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
          <Modal.Title>{editMode ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* === Section 1: Product Basics === */}
            <div className="form-section">
              <h5 className="section-title">🧂 Product Basics</h5>

              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={selectedProduct.name} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={selectedProduct.category} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Our Story</Form.Label>
                <Form.Control type="text" name="story" value={selectedProduct.story} onChange={handleInputChange} />
              </Form.Group>

              <Form.Group>
                <Form.Label>How to Use</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="howToUse"
                  value={(selectedProduct.howToUse || []).join('\n')}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, howToUse: e.target.value.split('\n') })}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Benefits</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="benefits"
                  value={(selectedProduct.benefits || []).join('\n')}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, benefits: e.target.value.split('\n') })}
                />
              </Form.Group>
            </div>

            {/* === Section 2: Nutrition Info === */}
            <div className="form-section">
              <h5 className="section-title">🥦 Nutrition Information (Per 100g)</h5>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Nutrient</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProduct.nutrition || []).map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...selectedProduct.nutrition];
                            updated[index].name = e.target.value;
                            setSelectedProduct({ ...selectedProduct, nutrition: updated });
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const updated = [...selectedProduct.nutrition];
                            updated[index].value = e.target.value;
                            setSelectedProduct({ ...selectedProduct, nutrition: updated });
                          }}
                        />
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const updated = [...selectedProduct.nutrition];
                            updated.splice(index, 1);
                            setSelectedProduct({ ...selectedProduct, nutrition: updated });
                          }}
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  const updated = [...(selectedProduct.nutrition || [])];
                  updated.push({ name: "", value: "" });
                  setSelectedProduct({ ...selectedProduct, nutrition: updated });
                }}
              >
                + Add Nutrient
              </Button>

              <Form.Group className="mt-3">
                <Form.Label>Nutrition Note</Form.Label>
                <Form.Control
                  type="text"
                  name="nutritionNote"
                  value={selectedProduct.nutritionNote || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>

            {/* === Section 3: Customer Support === */}
            <div className="form-section">
              <h5 className="section-title">📞 Customer Support</h5>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedProduct.customerSupport?.email || ""}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      customerSupport: {
                        ...selectedProduct.customerSupport,
                        email: e.target.value,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Phone / Call</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.customerSupport?.phone || ""}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      customerSupport: {
                        ...selectedProduct.customerSupport,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>WhatsApp</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.customerSupport?.whatsapp || ""}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      customerSupport: {
                        ...selectedProduct.customerSupport,
                        whatsapp: e.target.value,
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Website / Reorder Link</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.customerSupport?.website || ""}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      customerSupport: {
                        ...selectedProduct.customerSupport,
                        website: e.target.value,
                      },
                    })
                  }
                />
              </Form.Group>
            </div>

            {/* === Section 4: Pricing & Logistics === */}
            <div className="form-section">
              <h5 className="section-title">🚚 Price, Quantity & Shipping</h5>

              {sizes.map(({ id, sizeLabel, price, quantity, isActive }) => (
                <Card key={id} className="mb-2 shadow-sm compact-size-card">
                  <Card.Body className="p-2">
                    <Row className="align-items-center gx-2">
                      <Col md={3} sm={4} xs={6}>
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder="Size (e.g. 1kg)"
                          value={sizeLabel}
                          onChange={(e) => handleSizeChange(id, "sizeLabel", e.target.value)}
                        />
                      </Col>

                      <Col md={3} sm={3} xs={6}>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={price}
                          onChange={(e) => handleSizeChange(id, "price", e.target.value)}
                        />
                      </Col>

                      <Col md={3} sm={3} xs={6}>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          placeholder="Qty"
                          value={quantity}
                          onChange={(e) => handleSizeChange(id, "quantity", e.target.value)}
                        />
                      </Col>

                      <Col md={1} sm={2} xs={4} className="d-flex justify-content-center">
                        <Form.Check
                          size="sm"
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => handleSizeChange(id, "isActive", e.target.checked)}
                          aria-label="Active"
                          className="m-auto"
                        />
                      </Col>

                      <Col md={1} sm={3} xs={6} className="text-md-end mt-2 mt-md-0">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-remove-${id}`}>Remove</Tooltip>}
                        >
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => removeSize(id)}
                            aria-label="Remove size"
                            style={{ fontSize: '1.2rem' }}
                          >
                            <FaTrashAlt />
                          </Button>
                        </OverlayTrigger>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              <Button variant="primary" onClick={addSize} className="mb-3">
                Add Size
              </Button>

              <Form.Group>
                <Form.Label>Shipping Fee</Form.Label>
                <Form.Control
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Product Image</Form.Label>
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
          {/* {imageFile && (
            <Button variant="info" onClick={handleImageUpload}>
              Upload Image
            </Button>
          )} */}
        </Modal.Footer>
      </Modal >

      {/* Tax Modal */}
      < Modal show={showTaxModal} onHide={() => setShowTaxModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Tax Rate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isTaxLoading ? <p>Loading...</p> : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tax Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter tax rate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaxModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveTax}>Save</Button>
        </Modal.Footer>
      </Modal >

      {/* Shipping Settings Modal */}
      < Modal show={showShippingModal} onHide={() => setShowShippingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Shipping Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enable Order Shipping</Form.Label>
              <Form.Check
                type="checkbox"
                checked={shippingSettings.enableOrderShipping}
                onChange={(e) => setShippingSettingsState({ ...shippingSettings, enableOrderShipping: e.target.checked })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Shipping Cap (Maximum)</Form.Label>
              <Form.Control
                type="number"
                value={shippingSettings.shippingCap}
                onChange={(e) => setShippingSettingsState({ ...shippingSettings, shippingCap: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Free Shipping Above</Form.Label>
              <Form.Control
                type="number"
                value={shippingSettings.freeShippingAbove}
                onChange={(e) => setShippingSettingsState({ ...shippingSettings, freeShippingAbove: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShippingModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveShippingSettings}>Save</Button>
        </Modal.Footer>
      </Modal >
    </>
  );
};

export default Products;
