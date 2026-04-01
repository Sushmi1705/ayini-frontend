import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../../../services/orderService";
import PageTitle from "../../../components/PageTitle";

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatDateAndTime = (timestamp) => {
  if (!timestamp || typeof timestamp !== "object" || !("_seconds" in timestamp)) {
    return { date: "N/A", time: "" };
  }
  const dateObj = new Date(timestamp._seconds * 1000);
  const date = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
};

// Item Table
const Items = ({ order }) => {
  const items = order.items || [];
  
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-centered mb-0">
        <thead className="table-light">
          <tr>
            <th>Product Name</th>
            <th>Image</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const quantity = Number(item.cartQty || item.quantity || 0);
            const price = Number(item.unitPrice || item.price || 0);
            const lineTotal = Number(item.lineTotal || quantity * price);
            
            return (
              <tr key={index}>
                <th scope="row">{item.name}</th>
                <td>
                  <img src={item.image || "/placeholder.png"} alt={item.name} height="32" />
                </td>
                <td>{quantity}</td>
                <td>{formatCurrency(price)}</td>
                <td>{formatCurrency(lineTotal)}</td>
              </tr>
            );
          })}
          <tr>
            <th scope="row" colSpan={4} className="text-end">
              Sub Total :
            </th>
            <td>
              <div className="fw-bold">{formatCurrency(order.cartSubtotal)}</div>
            </td>
          </tr>
          <tr>
            <th scope="row" colSpan={4} className="text-end">
              Shipping Charge :
            </th>
            <td>{formatCurrency(order.shipping)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan={4} className="text-end">
              Estimated Tax :
            </th>
            <td>{formatCurrency(order.vat)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan={4} className="text-end">
              Total :
            </th>
            <td>
              <div className="fw-bold">{formatCurrency(order.total || order.cartSubtotal)}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// shipping info
const ShippingInfo = ({ details }) => {
  if (!details) return <p>No shipping details available.</p>;
  return (
    <React.Fragment>
      <h5 className="font-family-primary fw-semibold">{details.firstName} {details.lastName}</h5>
      <p className="mb-2">
        <span className="fw-semibold me-2">Address:</span> {details.address}, {details.city}, {details.state} {details.zip}
      </p>
      <p className="mb-2">
        <span className="fw-semibold me-2">Phone:</span> {details.phone}
      </p>
      <p className="mb-0">
        <span className="fw-semibold me-2">Email:</span> {details.email}
      </p>
    </React.Fragment>
  );
};

// billing info
const BillingInfo = ({ details, paymentMethod }) => {
  if (!details) return <p>No billing details available.</p>;
  return (
    <React.Fragment>
      <ul className="list-unstyled mb-0">
        <li>
          <p className="mb-2">
            <span className="fw-semibold me-2">Payment Type:</span>{" "}
            {paymentMethod || "N/A"}
          </p>
          <p className="mb-2">
            <span className="fw-semibold me-2">Billing Name:</span>{" "}
            {details.firstName} {details.lastName}
          </p>
          <p className="mb-2">
            <span className="fw-semibold me-2">Address:</span>{" "}
            {details.address}, {details.city}, {details.state} {details.zip}
          </p>
        </li>
      </ul>
    </React.Fragment>
  );
};

// delivery info
const DeliveryInfo = ({ order }) => {
  return (
    <React.Fragment>
      <div className="text-center">
        <i className="mdi mdi-truck-fast h2 text-muted"></i>
        <h5>
          <b>{order.sentToCustomer ? "Sent to Customer" : "Processing"}</b>
        </h5>
        <p className="mb-1">
          <span className="fw-semibold">Order ID :</span> #{order.id?.slice(0, 8).toUpperCase()}
        </p>
        <p className="mb-0">
          <span className="fw-semibold">Payment Mode :</span>{" "}
          {order.paymentMethod || "N/A"}
        </p>
      </div>
    </React.Fragment>
  );
};

// order details
const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (error || !order) {
    return <div className="text-center mt-5 text-danger">{error || "Order not found."}</div>;
  }

  return (
    <React.Fragment>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Ecommerce",
            path: "/apps/ecommerce/orders",
          },
          {
            label: "Order Detail",
            path: `/apps/ecommerce/order/${id}`,
            active: true,
          },
        ]}
        title={"Order Detail"}
      />

      <Row>
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Order Status</h4>
              <Row>
                <Col lg={12}>
                  <div className="mb-4">
                    <h5 className="mt-0">Order ID:</h5>
                    <p>#{order.id}</p>
                  </div>
                </Col>
                <Col lg={12}>
                  <div className="mb-4">
                    <h5 className="mt-0">Order Placed:</h5>
                    <p>
                      {formatDateAndTime(order.createdAt).date} at {formatDateAndTime(order.createdAt).time}
                    </p>
                  </div>
                </Col>
                <Col lg={12}>
                  <div className="mb-1">
                    <h5 className="mt-0">Status:</h5>
                    <p className={`badge bg-${order.status === 'Paid' ? 'success' : order.status === 'Pending' ? 'warning' : 'info'} p-2`}>
                      {order.status || "Pending"}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Items from Order #{order.id?.slice(0, 8).toUpperCase()}</h4>
              <Items order={order} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Shipping Information</h4>
              <ShippingInfo details={order.shippingDetails} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Billing Information</h4>
              <BillingInfo details={order.billingDetails} paymentMethod={order.paymentMethod} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Delivery Info</h4>
              <DeliveryInfo order={order} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default OrderDetails;