import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";
import * as XLSX from "xlsx";
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import { getAllOrders, deleteOrder } from "../../../services/orderService";

const OrderColumn = ({ row }) => (
  <Link to={`/apps/ecommerce/order/${row.original.id}`} className="text-body fw-bold">
    {row.original.id}
  </Link>
);

const ProductsColumn = ({ row }) => (
  <>
    {(row.original.product_img || []).map((img, index) => (
      <Link to="/apps/ecommerce/product-details" key={index}>
        <img src={img} alt="" height="32" className="me-1" />
      </Link>
    ))}
  </>
);

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
  const status = "Completed";
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

const ActionColumn = ({ row, refresh }) => (
  <>
    <Link to={`/apps/ecommerce/order/${row.original.id}`} className="action-icon">
      <i className="mdi mdi-eye"></i>
    </Link>
    <Link to="#" className="action-icon">
      <i className="mdi mdi-square-edit-outline"></i>
    </Link>
    <Link
      to="#"
      className="action-icon"
      onClick={() => {
        if (window.confirm("Are you sure you want to delete this order?")) {
          deleteOrder(row.original.id).then(() => refresh());
        }
      }}
    >
      <i className="mdi mdi-delete"></i>
    </Link>
  </>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      console.log('124--------', data);
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders:", err.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeOrderStatusGroup = (statusGroup) => {
    loadOrders().then(() => {
      if (statusGroup !== "All") {
        setOrders((prev) =>
          prev.filter((o) => o.payment_status?.includes(statusGroup))
        );
      }
    });
  };

  const handleExport = () => {
    if (!orders.length) return;

    const exportData = orders.map((order) => {
      const { date, time } = formatDateAndTime(order.createdAt);
      return {
        "Order ID": order.id,
        "Date": date,
        "Time": time,
        "Payment Status": order.status,
        "Total Amount": order.total,
        "Payment Method": order.paymentMethod,
        "Order Status": order.order_status || "Completed",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, "orders_export.xlsx");
  };

  const columns = [
    { Header: "Order ID", accessor: "order_id", Cell: OrderColumn },
    // { Header: "Products", accessor: "product_img", Cell: ProductsColumn },
    { Header: "Date", accessor: "createdAt", Cell: OrderDateColumn },
    { Header: "Payment Status", accessor: "status", Cell: PaymentStatusColumn },
    { Header: "Total", accessor: "total" },
    { Header: "Payment Method", accessor: "paymentMethod" },
    { Header: "Order Status", accessor: "order_status", Cell: StatusColumn },
    // { Header: "Action", accessor: "action", Cell: (props) => <ActionColumn {...props} refresh={loadOrders} /> },
  ];

  const sizePerPageList = [
    { text: "10", value: 10 },
    { text: "20", value: 20 },
    { text: "50", value: 50 },
  ];

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Ecommerce", path: "/apps/ecommerce/orders" },
          { label: "Orders", path: "/apps/ecommerce/orders", active: true },
        ]}
        title={"Orders"}
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {/* <Row className="align-items-center">
                <Col lg={8}>
                  <form className="row gy-2 gx-2 align-items-center justify-content-lg-start justify-content-between">
                    <div className="col-auto">
                      <div className="d-flex align-items-center w-auto">
                        <label htmlFor="status-select" className="me-2">
                          Status
                        </label>
                        <select
                          className="form-select"
                          id="status-select"
                          onChange={(e) => changeOrderStatusGroup(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="Paid">Paid</option>
                          <option value="Awaiting Authorization">Awaiting Authorization</option>
                          <option value="Payment Failed">Payment Failed</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </Col>
                <Col lg={4}>
                  <div className="text-lg-end mt-xl-0 mt-2">
                    <Button className="btn btn-success mb-2 me-2" onClick={handleExport}>
                      <i className="mdi mdi-file-excel me-1"></i> Export to Excel
                    </Button>
                  </div>
                </Col>
              </Row> */}

              <Table
                columns={columns}
                data={orders}
                isSearchable={true}
                pageSize={10}
                sizePerPageList={sizePerPageList}
                isSortable={true}
                pagination={true}
                isSelectable={true}
                theadClass="table-light"
                searchBoxClass="mb-2"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Orders;
