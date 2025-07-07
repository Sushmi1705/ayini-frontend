import { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Chart from "react-apexcharts";
import ChartStatistics from "../../../components/ChartStatistics";
import { fetchDashboardOverview } from "../../../services/dashboardService"; // adjust import as needed

const RevenueChart = () => {
  const [revenue, setRevenue] = useState(0);
  const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const overview = await fetchDashboardOverview();
        setRevenue(parseFloat(overview.totalRevenue || 0));
        setLastWeekRevenue(parseFloat(overview.lastWeekRevenue || 0));
        setLastMonthRevenue(parseFloat(overview.lastMonthRevenue || 0));
        // console.log('19--------', lastWeekRevenue);
        // console.log('20------------', lastMonthRevenue);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchRevenue();
  }, []);

  const apexOpts = {
    chart: {
      height: 242,
      type: "radialBar"
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "65%"
        }
      }
    },
    colors: ["#f1556c"],
    labels: ["Revenue"]
  };

  const apexData = [Math.round((revenue / 1000) * 100)]; // sample percentage if $1000 is target

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-0">Total Revenue</h4>

        <div className="widget-chart text-center" dir="ltr">
          <Chart
            options={apexOpts}
            series={apexData}
            type="radialBar"
            height={242}
            className="apex-charts mt-0"
          />

          <h5 className="text-muted mt-0">Total sales made</h5>
          <h2>{revenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}</h2>

          <p className="text-muted w-75 mx-auto sp-line-2">
            Revenue generated from all sales till date.
          </p>

          <Row className="row mt-3">
            {/* <Col className="col-4">
              <ChartStatistics title="Target" icon="fe-arrow-down" stats="$7.8k" variant="danger" />
            </Col> */}
            <Col className="col-4">
              <ChartStatistics
                title="Last week"
                icon={lastWeekRevenue >= 0 ? "fe-arrow-up" : "fe-arrow-down"}
                stats={lastWeekRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                variant={lastWeekRevenue >= 0 ? "success" : "danger"}
              />
            </Col>
            <Col className="col-4">
              <ChartStatistics
                title="Last Month"
                icon={lastMonthRevenue >= 0 ? "fe-arrow-up" : "fe-arrow-down"}
                stats={lastMonthRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                variant={lastMonthRevenue >= 0 ? "success" : "danger"}
              />
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RevenueChart;
