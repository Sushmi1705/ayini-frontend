import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import StatisticsWidget from "../../../components/StatisticsWidget";
import { fetchDashboardOverview } from "../../../services/dashboardService";

const Statistics = () => {
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    productsSold: 0,
    newCustomers: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardOverview();
        setOverview(data);
        console.log(overview);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    loadData();
  }, []);

  return (
    <Row>
      <Col md={6} xl={3}>
        <StatisticsWidget
          variant="primary"
          counterOptions={{ prefix: "₹" }}
          description="Total Revenue"
          stats={overview.totalRevenue}
          icon="fe-credit-card"
        />
      </Col>
      <Col md={6} xl={3}>
        <StatisticsWidget
          variant="success"
          description="Total Orders"
          stats={overview.totalOrders}
          icon="fe-shopping-cart"
        />
      </Col>
      <Col md={6} xl={3}>
        <StatisticsWidget
          variant="info"
          description="Products Sold"
          stats={overview.productsSold}
          icon="fe-package"
        />
      </Col>
      <Col md={6} xl={3}>
        <StatisticsWidget
          variant="warning"
          description="New Customers"
          stats={overview.newCustomers}
          icon="fe-users"
        />
      </Col>
    </Row>
  );
};

export default Statistics;
