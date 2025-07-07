import { useEffect, useState } from "react";
import { Card, Dropdown, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { getRecentPayments } from "../../../services/dashboardService";

const RevenueHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getRecentPayments();
      setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?._seconds) return "-";
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Card>
      <Card.Body>
        <Dropdown className="float-end" align="end">
          <Dropdown.Toggle as="a" className="card-drop cursor-pointer">
            <i className="mdi mdi-dots-vertical"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Export</Dropdown.Item>
            <Dropdown.Item>Download Report</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <h4 className="header-title mb-3">Revenue History</h4>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless table-hover table-nowrap table-centered m-0">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  {/* <th>User ID</th> */}
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {payments.map((item, i) => (
                  <tr key={i}>
                    <td>{item.id}</td>
                    {/* <td>{item.userId}</td> */}
                    <td>₹{parseFloat(item.amount).toFixed(2)}</td>
                    <td>
                      <span className={classNames("badge", {
                        "bg-soft-warning text-warning": item.status === "Pending",
                        "bg-soft-success text-success": item.status === "Completed",
                        "bg-soft-danger text-danger": item.status === "Failed",
                      })}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    {/* <td>
                      <Link to="#" className="btn btn-xs btn-light">
                        <i className="mdi mdi-eye-outline"></i>
                      </Link>
                    </td> */}
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RevenueHistory;
