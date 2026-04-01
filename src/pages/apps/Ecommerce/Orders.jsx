import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import classNames from "classnames";
import * as XLSX from "xlsx";
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import "../../../assets/scss/orders.scss";

import { getAllOrders, markOrderAsSent, markOrderAsPaid } from "../../../services/orderService";

const CustomerNameColumn = ({ row }) => {
  const billing = row.original.billingDetails || {};
  const fullName = `${billing.firstName || ""} ${billing.lastName || ""}`.trim() || "Unknown";
  return <span className="fw-bold">{fullName}</span>;
};

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

const OrderDateColumn = ({ row }) => {
  const { date, time } = formatDateAndTime(row.original.createdAt);
  return (
    <>
      {date} <small className="text-muted">{time}</small>
    </>
  );
};

const PaymentStatusColumn = ({ row }) => {
  const status = row.original.status || "Pending";
  return (
    <h5>
      <span
        className={classNames("badge", {
          "bg-soft-success text-success": status === "success" || status === "Paid",
          "bg-soft-danger text-danger": status === "Payment Failed",
          "bg-soft-info text-info": status === "Pending",
          "bg-soft-warning text-warning": status === "Awaiting Authorization",
        })}
      >
        {status === "Paid" && <i className="mdi mdi-bitcoin me-1"></i>}
        {status === "Payment Failed" && <i className="mdi mdi-cancel me-1"></i>}
        {status === "Unpaid" && <i className="mdi mdi-cash me-1"></i>}
        {status === "Awaiting Authorization" && <i className="mdi mdi-timer-sand me-1"></i>}
        {status}
      </span>
    </h5>
  );
};

const StatusColumn = ({ row }) => {
  const status = row.original.status || "Pending";
  return (
    <h5>
      <span
        className={classNames("badge", {
          "bg-success": status === "Completed",
          "bg-danger": status === "Cancelled",
          "bg-info": status === "Shipped",
          "bg-warning": status === "Processing",
          "bg-soft-info text-info": status === "Pending",
          "bg-soft-success text-success": status === "Paid",
        })}
      >
        {status}
      </span>
    </h5>
  );
};

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const getCreatedAtMs = (timestamp) => {
  if (!timestamp) return 0;
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp === "object" && "_seconds" in timestamp) {
    return timestamp._seconds * 1000;
  }
  const parsed = new Date(timestamp).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getTotalAmount = (order) => Number(order.total || order.cartSubtotal || 0);

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const isOnlinePaidOrder = (order) =>
  normalizeText(order.status) === "paid" &&
  !["cod", "direct bank transfer"].includes(normalizeText(order.paymentMethod));

const matchesPaymentMode = (order, paymentFilter) => {
  const paymentMethod = normalizeText(order.paymentMethod);

  switch (paymentFilter) {
    case "cod":
      return paymentMethod === "cod";
    case "bank-transfer":
      return paymentMethod === "direct bank transfer";
    case "online-paid":
      return isOnlinePaidOrder(order);
    default:
      return true;
  }
};

const sortOrders = (orders, sortBy) => {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    if (sortBy === "oldest") {
      return getCreatedAtMs(a.createdAt) - getCreatedAtMs(b.createdAt);
    }

    if (sortBy === "price-high") {
      return getTotalAmount(b) - getTotalAmount(a);
    }

    if (sortBy === "price-low") {
      return getTotalAmount(a) - getTotalAmount(b);
    }

    return getCreatedAtMs(b.createdAt) - getCreatedAtMs(a.createdAt);
  });

  return sorted;
};

// Action Column for Sent Orders
const ActionColumn = ({ row, refresh }) => {
  return !row.original.sentToCustomer ? (
    <Button
      size="sm"
      onClick={async () => {
        if (window.confirm("Mark this order as sent?")) {
          await markOrderAsSent(row.original.id);
          refresh();
        }
      }}
    >
      Mark as Sent
    </Button>
  ) : (
    <span className="text-success">Sent</span>
  );
};

// Action Column for Payment Pending Orders
const PaymentPendingActionColumn = ({ row, refresh }) => {
  return (
    <Button
      size="sm"
      onClick={async () => {
        if (window.confirm("Mark this order as Paid?")) {
          await markOrderAsPaid(row.original.id);
          refresh();
        }
      }}
    >
      Mark as Paid
    </Button>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err.message);
      setError(err.message || "Unable to load orders right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (orderId) => {
    console.log("Clicked Order ID:", orderId);

    const order = orders.find((o) => o.id === orderId); // find order from already fetched data
    if (order) {
      setSelectedOrder(order);
      setShowModal(true);
    } else {
      console.error("Order not found in state!");
    }
  };

  const handleExport = () => {
    if (!orders.length) return;
    const exportData = orders.map((order) => {
      const { date, time } = formatDateAndTime(order.createdAt);
      return {
        "Name": `${order.billingDetails?.firstName || ""} ${order.billingDetails?.lastName || ""}`.trim(),
        "Date": date,
        "Time": time,
        "Payment Status": order.status,
        "Total Amount": getTotalAmount(order),
        "Payment Method": order.paymentMethod,
        "Order Status": order.status || "Pending",
        "Sent": order.sentToCustomer ? "Yes" : "No",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders_export.xlsx");
  };

  const columns = useMemo(() => [
    { Header: "Customer Name", accessor: "billingDetails", Cell: CustomerNameColumn },
    { Header: "Date", accessor: "createdAt", Cell: OrderDateColumn },
    { Header: "Payment Status", accessor: "status", Cell: PaymentStatusColumn },
    { Header: "VAT", accessor: "vat", Cell: ({ value }) => formatCurrency(value) },
    { Header: "Shipping", accessor: "shipping", Cell: ({ value }) => formatCurrency(value) },
    { Header: "Total", accessor: "total", Cell: ({ row }) => formatCurrency(getTotalAmount(row.original)) },
    { Header: "Payment Method", accessor: "paymentMethod" },
    { Header: "Order Status", accessor: "status", Cell: StatusColumn },
    { Header: "Action", accessor: "action", Cell: (props) => <ActionColumn {...props} refresh={loadOrders} /> },
  ], []);

  const filteredOrders = useMemo(() => {
    const byStatus = orders.filter((order) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return normalizeText(order.status) === "pending";
      if (statusFilter === "paid") return normalizeText(order.status) === "paid";
      if (statusFilter === "sent") return Boolean(order.sentToCustomer);
      if (statusFilter === "not-sent") return !order.sentToCustomer;
      return normalizeText(order.status) === statusFilter;
    });

    const byPayment = byStatus.filter((order) => matchesPaymentMode(order, paymentFilter));
    return sortOrders(byPayment, sortBy);
  }, [orders, paymentFilter, sortBy, statusFilter]);

  const orderSummary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + getTotalAmount(order), 0);
    const pendingCount = orders.filter((order) => normalizeText(order.status) === "pending").length;
    const paidCount = orders.filter((order) => normalizeText(order.status) === "paid").length;
    const codCount = orders.filter((order) => normalizeText(order.paymentMethod) === "cod").length;

    return [
      { label: "Total Orders", value: orders.length, tone: "primary" },
      { label: "Pending", value: pendingCount, tone: "warning" },
      { label: "Paid", value: paidCount, tone: "success" },
      { label: "COD Orders", value: codCount, tone: "info" },
      { label: "Revenue", value: formatCurrency(totalRevenue), tone: "dark" },
    ];
  }, [orders]);

  const sizePerPageList = [
    { text: "10", value: 10 },
    { text: "20", value: 20 },
    { text: "50", value: 50 },
  ];

  return (
    <>
      <PageTitle
        title="Orders"
        breadCrumbItems={[
          { label: "Ecommerce", path: "/apps/ecommerce/orders" },
          { label: "Orders", path: "/apps/ecommerce/orders", active: true },
        ]}
      />

      <Row>
        {orderSummary.map((item) => (
          <Col key={item.label} md={6} xl className="mb-3">
            <Card className={`admin-metric-card tone-${item.tone}`}>
              <Card.Body>
                <div className="admin-metric-label">{item.label}</div>
                <div className="admin-metric-value">{item.value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col>
          <Card className="admin-panel-card">
            <Card.Body>
              <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between mb-3">
                <div className="d-flex flex-wrap gap-3">
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="newest">Latest to Old</option>
                      <option value="oldest">Old to New</option>
                      <option value="price-high">Price High to Low</option>
                      <option value="price-low">Price Low to High</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="sent">Sent to Customer</option>
                      <option value="not-sent">Not Sent</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Payment Type</Form.Label>
                    <Form.Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                      <option value="all">All Payments</option>
                      <option value="cod">COD</option>
                      <option value="online-paid">Online Paid</option>
                      <option value="bank-transfer">Direct Bank Transfer</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="d-flex gap-2 align-items-center">
                  <span className="text-muted">{filteredOrders.length} orders</span>
                  <Button className="btn btn-success" onClick={handleExport} disabled={!orders.length}>
                    <i className="mdi mdi-file-excel me-1"></i> Export
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="py-5 text-center">
                  <Spinner animation="border" />
                </div>
              ) : filteredOrders.length ? (
                <Table
                  columns={[
                    ...columns.filter((c) => c.accessor !== "action"),
                    {
                      Header: "Action",
                      accessor: "action",
                      Cell: (props) => {
                        const order = props.row.original;
                        const showMarkPaid =
                          ["cod", "direct bank transfer"].includes(normalizeText(order.paymentMethod)) &&
                          normalizeText(order.status) !== "paid";

                        return (
                          <>
                            <ActionColumn {...props} refresh={loadOrders} />
                            {showMarkPaid && (
                              <PaymentPendingActionColumn {...props} refresh={loadOrders} />
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleRowClick(order.id)}
                            >
                              View Details
                            </Button>
                          </>
                        );
                      },
                    },
                  ]}
                  data={filteredOrders}
                  pageSize={10}
                  sizePerPageList={sizePerPageList}
                  pagination
                  isSearchable
                />
              ) : (
                <div className="admin-empty-state">
                  <div className="admin-empty-title">No orders match these filters</div>
                  <p className="text-muted mb-3">Try changing the status, payment, or sort options to see more results.</p>
                  <Button variant="outline-primary" onClick={() => {
                    setSortBy("newest");
                    setStatusFilter("all");
                    setPaymentFilter("all");
                  }}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Order Details Popup */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedOrder && (
            <div className="order-details">
              <Row>
                {/* LEFT: Order Summary */}
                <Col md={5}>
                  <h5 className="mb-3">Order Info</h5>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDateAndTime(selectedOrder.createdAt).date}{" "}
                    {formatDateAndTime(selectedOrder.createdAt).time}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {`${selectedOrder.billingDetails?.firstName || ""} ${selectedOrder.billingDetails?.lastName || ""}`}
                  </p>
                  <p><strong>Email:</strong> {selectedOrder.billingDetails?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedOrder.billingDetails?.phone || "N/A"}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Sent to Customer:</strong> {selectedOrder.sentToCustomer ? "Yes" : "No"}</p>
                </Col>

                {/* RIGHT: Cart Items */}
                <Col md={7}>
                  <h5 className="mb-3">Items</h5>
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, i) => {
                        const quantity = Number(item.cartQty || item.quantity || 0);
                        const price = Number(item.unitPrice || item.price || 0);
                        const total = Number(item.lineTotal || quantity * price);

                        return (
                          <tr key={i}>
                            <td>
                              <img
                                src={item.image || "/placeholder.png"}
                                alt={item.name}
                                width="40"
                                height="40"
                              />
                            </td>
                            <td>{item.name}</td>
                            <td>{quantity}</td>
                            <td>{formatCurrency(price)}</td>
                            <td>{formatCurrency(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="mt-3">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Subtotal:</strong></td>
                          <td className="text-end">
                            {formatCurrency(selectedOrder.cartSubtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Shipping:</strong></td>
                          <td className="text-end">
                            {formatCurrency(selectedOrder.shipping)}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Tax:</strong></td>
                          <td className="text-end">
                            {formatCurrency(selectedOrder.vat)}
                          </td>
                        </tr>
                        <tr className="fw-bold border-top">
                          <td><strong>Total:</strong></td>
                          <td className="text-end">
                            {formatCurrency(getTotalAmount(selectedOrder))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



    </>
  );
};

export default Orders;
