import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";
import * as XLSX from "xlsx"; // ✅ import xlsx
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import { getAllPayments } from "../../../services/paymentService";

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

const DateColumn = ({ row }) => {
  const { date, time } = formatDateAndTime(row.original.createdAt);
  return (
    <>
      {date} <small className="text-muted">{time}</small>
    </>
  );
};

const StatusColumn = ({ row }) => {
  const status = row.original.status;
  return (
    <span
      className={classNames("badge", {
        "bg-soft-success text-success": status === "Completed",
        "bg-soft-warning text-warning": status === "Pending",
        "bg-soft-danger text-danger": status === "Failed",
      })}
    >
      {status}
    </span>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);

  const loadPayments = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch (err) {
      console.error("Error loading payments:", err.message);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // ✅ Export to Excel Function
  const exportToExcel = () => {
    const exportData = payments.map((item) => {
      const { date, time } = formatDateAndTime(item.createdAt);
      return {
        "Transaction ID": item.transactionId,
        "Order ID": item.orderId,
        "User ID": item.userId,
        "Email": item.email,
        "Mobile": item.mobile,
        "Amount": item.amount,
        "Currency": item.currency,
        "Payment Method": item.paymentMethod,
        "Gateway": item.paymentGateway,
        "Status": item.status,
        "Date": date,
        "Time": time,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  const columns = [
    { Header: "Transaction ID", accessor: "transactionId" },
    { Header: "Order ID", accessor: "orderId" },
    { Header: "User ID", accessor: "userId" },
    { Header: "Email", accessor: "email" },
    { Header: "Mobile", accessor: "mobile" },
    { Header: "Amount", accessor: "amount" },
    { Header: "Currency", accessor: "currency" },
    { Header: "Payment Method", accessor: "paymentMethod" },
    { Header: "Gateway", accessor: "paymentGateway" },
    { Header: "Status", accessor: "status", Cell: StatusColumn },
    { Header: "Date", accessor: "createdAt", Cell: DateColumn },
  ];

  const sizePerPageList = [
    { text: "10", value: 10 },
    { text: "20", value: 20 },
    { text: "50", value: 50 },
  ];

  return (
    <>
      <PageTitle
        breadCrumbItems={[{ label: "Ecommerce", path: "/apps/ecommerce/payments" }, { label: "Payments", active: true }]}
        title={"Payments"}
      />

      <Row className="mb-3">
        <Col>
          <Button variant="success" onClick={exportToExcel}>
            Export to Excel
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table
                columns={columns}
                data={payments}
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

export default Payments;
