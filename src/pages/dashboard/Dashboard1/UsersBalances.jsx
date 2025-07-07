import { useEffect, useState } from "react";
import { Card, Dropdown, Spinner } from "react-bootstrap";
import classNames from "classnames";
import { getRecentOrders } from "../../../services/dashboardService";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getRecentOrders();
      setOrders(data);
      console.log('14--------', orders);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?._seconds) return "-";
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <Card>
      <Card.Body>
        <Dropdown className="float-end" align="end">
          <Dropdown.Toggle as="a" className="card-drop cursor-pointer">
            <i className="mdi mdi-dots-vertical"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>View All Orders</Dropdown.Item>
            <Dropdown.Item>Export</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <h4 className="header-title mb-3">Recent Orders</h4>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless table-hover table-nowrap table-centered m-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  {/* <th>User ID</th> */}
                  <th>Payment Method</th>
                  <th>Total (₹)</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td>
                      <span className="fw-semibold">{order.id}</span>
                    </td>
                    {/* <td>{order.userId}</td> */}
                    <td>
                      <span
                        className={classNames("badge", {
                          "bg-success": order.paymentMethod === "Cash on Delivery",
                          "bg-info": order.paymentMethod === "Direct Bank Transfer",
                          "bg-warning": order.paymentMethod === "Razorpay",
                        })}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>₹{order.total}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No orders found.
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

export default RecentOrders;
