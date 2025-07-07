import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Modal } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import {
  getAllCustomers,
  deleteCustomer,
} from "../../../services/userService";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers();

      const withFallback = res.map((cust) => ({
        ...cust,
        phone: cust.billingDetails?.phone || "N/A",
        name:
          cust.billingDetails?.firstName +
          " " +
          cust.billingDetails?.lastName || "Unknown",
        balance: "₹0.00",
        orders: cust.totalOrders,
        last_order: formatDateAndTime(cust.lastOrder),
        status: "Active",
        avatar: "https://via.placeholder.com/32",
      }));
      setCustomers(withFallback);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert("Error deleting customer");
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const LastOrderColumn = ({ row }) => (
    <>
      {row.original.last_order.date}{" "}
      <small className="text-muted">{row.original.last_order.time}</small>
    </>
  );

  const StatusColumn = ({ row }) => (
    <span
      className={classNames("badge", {
        "badge-soft-success": row.original.status === "Active",
        "badge-soft-danger": row.original.status === "Blocked",
      })}
    >
      {row.original.status}
    </span>
  );

  const ActionColumn = ({ row }) => (
    <>
      <Link
        to="#"
        className="action-icon"
        onClick={() => handleViewCustomer(row.original)}
      >
        <i className="mdi mdi-eye"></i>
      </Link>
      <Link
        to="#"
        className="action-icon"
        onClick={() => handleDelete(row.original.id)}
      >
        <i className="mdi mdi-delete"></i>
      </Link>
    </>
  );

  const columns = [
    {
      Header: "Customer",
      accessor: "name",
      sort: true,
      classes: "table-user",
    },
    { Header: "Phone", accessor: "phone", sort: true },
    { Header: "Orders", accessor: "orders", sort: true },
    {
      Header: "Last Order",
      accessor: "last_order",
      sort: true,
      Cell: LastOrderColumn,
    },
    { Header: "Status", accessor: "status", sort: true, Cell: StatusColumn },
    { Header: "Action", accessor: "action", sort: false, Cell: ActionColumn },
  ];

  const sizePerPageList = [
    { text: "10", value: 10 },
    { text: "25", value: 25 },
    { text: "All", value: customers.length },
  ];

  const CustomerDetailsModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Customer Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedCustomer ? (
          <div>
            <Row className="mb-3">
              <Col md={3}>
                <img
                  src={selectedCustomer.avatar}
                  alt="Avatar"
                  className="rounded-circle"
                  width="80"
                  height="80"
                />
              </Col>
              <Col md={9}>
                <h5>{selectedCustomer.name}</h5>
                <p>Phone: {selectedCustomer.phone}</p>
                <p>Email: {selectedCustomer.billingDetails?.email || "N/A"}</p>
              </Col>
            </Row>
            <hr />
            <p>
              <strong>Orders:</strong> {selectedCustomer.orders}
            </p>
            <p>
              <strong>Last Order:</strong>{" "}
              {selectedCustomer.last_order.date} {selectedCustomer.last_order.time}
            </p>
            <p>
              <strong>Status:</strong> {selectedCustomer.status}
            </p>
            <p>
              <strong>Billing Address:</strong>{" "}
              {selectedCustomer.billingDetails?.companyAddress || "N/A"}
            </p>
          </div>
        ) : (
          <p>No customer selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Ecommerce", path: "/apps/ecommerce/customers" },
          { label: "Customers", path: "/apps/ecommerce/customers", active: true },
        ]}
        title={"Customers"}
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Table
                  columns={columns}
                  data={customers}
                  pageSize={10}
                  sizePerPageList={sizePerPageList}
                  isSortable={true}
                  pagination={true}
                  isSelectable={true}
                  isSearchable={true}
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Customer Modal */}
      <CustomerDetailsModal />
    </>
  );
};

export default Customers;
