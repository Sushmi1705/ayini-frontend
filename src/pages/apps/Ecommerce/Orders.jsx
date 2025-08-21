import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Button, Nav, Tab, Modal } from "react-bootstrap";
import classNames from "classnames";
import * as XLSX from "xlsx";
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import "../../../assets/scss/orders.scss";

import { getAllOrders, deleteOrder, markOrderAsSent, markOrderAsPaid, getOrderById } from "../../../services/orderService"; // <-- added markOrderAsPaid

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
  const status = row.original.status;
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
  const status = row.original.order_status || "Completed";
  return (
    <h5>
      <span
        className={classNames("badge", {
          "bg-success": status === "Completed",
          "bg-danger": status === "Cancelled",
          "bg-info": status === "Shipped",
          "bg-warning": status === "Processing",
        })}
      >
        {status}
      </span>
    </h5>
  );
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
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);


  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err.message);
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
        "Total Amount": order.total,
        "Payment Method": order.paymentMethod,
        "Order Status": order.order_status || "Completed",
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
    { Header: "VAT", accessor: "vat" },
    { Header: "Shipping", accessor: "shipping" },
    { Header: "Total", accessor: "total" },
    { Header: "Payment Method", accessor: "paymentMethod" },
    { Header: "Order Status", accessor: "order_status", Cell: StatusColumn },
    { Header: "Action", accessor: "action", Cell: (props) => <ActionColumn {...props} refresh={loadOrders} /> },
  ], []);

  const pendingOrders = orders.filter(o => !o.sentToCustomer);
  const sentOrders = orders.filter(o => o.sentToCustomer);
  const paymentPendingOrders = orders.filter(
    o => (o.paymentMethod === "COD" || o.paymentMethod === "Direct Bank Transfer") && o.status !== "Paid"
  );

  const sizePerPageList = [
    { text: "10", value: 10 },
    { text: "20", value: 20 },
    { text: "50", value: 50 },
  ];

  console.log('193-----', selectedOrder);
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
        <Col>
          <Card>
            <Card.Body>
              {/* <div className="d-flex justify-content-end mb-3">
                <Button className="btn btn-success" onClick={handleExport}>
                  <i className="mdi mdi-file-excel me-1"></i> Export to Excel
                </Button>
              </div> */}

              <Tab.Container defaultActiveKey="pending">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="pending">Pending Orders ({pendingOrders.length})</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="sent">Sent Orders ({sentOrders.length})</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="paymentPending">
                      Payment Pending ({paymentPendingOrders.length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-3">
                  <Tab.Pane eventKey="pending">
                    <Table
                      columns={[
                        ...columns.filter(c => c.accessor !== "action"),
                        {
                          Header: "Action",
                          accessor: "action",
                          Cell: (props) => (
                            <>
                              <ActionColumn {...props} refresh={loadOrders} />

                              {/* Your existing pending actions */}
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleRowClick(props.row.original.id)}
                              >
                                View Details
                              </Button>
                            </>
                          ),
                        },
                      ]}
                      data={pendingOrders}
                      pageSize={10}
                      sizePerPageList={sizePerPageList}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="sent">
                    <Table
                      columns={[
                        ...columns.filter(c => c.accessor !== "action"),
                        {
                          Header: "Action",
                          accessor: "action",
                          Cell: (props) => (
                            <>
                              {/* Your existing sent actions */}
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleRowClick(props.row.original.id)}
                              >
                                View Details
                              </Button>
                            </>
                          ),
                        },
                      ]}
                      data={sentOrders}
                      pageSize={10}
                      sizePerPageList={sizePerPageList}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="paymentPending">
                    <Table
                      columns={[
                        ...columns.filter(c => c.accessor !== "action"),
                        {
                          Header: "Action",
                          accessor: "action",
                          Cell: (props) => (
                            <>
                              {/* Existing button */}
                              <PaymentPendingActionColumn {...props} refresh={loadOrders} />

                              {/* New View Details button */}
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleRowClick(props.row.original.id)}
                              >
                                View Details
                              </Button>
                            </>
                          ),
                        },
                      ]}
                      data={paymentPendingOrders}
                      pageSize={10}
                      sizePerPageList={sizePerPageList}
                    />
                  </Tab.Pane>

                </Tab.Content>
              </Tab.Container>
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
                  <p><strong>Order Status:</strong> {selectedOrder.order_status}</p>
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
                        const cartItem = selectedOrder.cart?.find(c => c.productId === item.productId);
                        const quantity = cartItem?.quantity || 0;
                        const price = Number(item.price) || 0;
                        const total = quantity * price;

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
                            <td>{price.toFixed(2)} {selectedOrder.currency || "₹"}</td>
                            <td>{total.toFixed(2)} {selectedOrder.currency || "₹"}</td>
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
                            {selectedOrder.cartSubtotal || "0.00"} {selectedOrder.currency || "₹"}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Shipping:</strong></td>
                          <td className="text-end">
                            {selectedOrder.shipping?.toFixed(2) || "0.00"} {selectedOrder.currency || "₹"}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Tax:</strong></td>
                          <td className="text-end">
                            {selectedOrder.vat || "0.00"} {selectedOrder.currency || "₹"}
                          </td>
                        </tr>
                        <tr className="fw-bold border-top">
                          <td><strong>Total:</strong></td>
                          <td className="text-end">
                            {selectedOrder.total || "0.00"} {selectedOrder.currency || "₹"}
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
