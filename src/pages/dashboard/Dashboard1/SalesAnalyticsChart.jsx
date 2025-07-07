import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card } from "react-bootstrap";
import { getSalesAnalytics } from "../../../services/dashboardService";

const SalesAnalyticsChart = () => {
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { labels, revenueData, salesData } = await getSalesAnalytics();
        setLabels(labels);
        setSeries([
          { name: "Revenue", type: "column", data: revenueData },
          { name: "Sales", type: "line", data: salesData }
        ]);
      } catch (err) {
        console.error("Error loading sales chart:", err);
      }
    };
    fetchData();
  }, []);

  const apexOpts = {
    chart: { height: 378, type: "line", offsetY: 10 },
    stroke: { width: [2, 3] },
    plotOptions: { bar: { columnWidth: "50%" } },
    colors: ["#1abc9c", "#4a81d4"],
    dataLabels: { enabled: true, enabledOnSeries: [1] },
    labels: labels,
    xaxis: { type: "category" },
    legend: { offsetY: 7 },
    grid: { padding: { bottom: 20 } },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        inverseColors: true,
        opacityFrom: 0.75,
        opacityTo: 0.75,
        stops: [0, 0, 0]
      }
    },
    yaxis: [
      { title: { text: "Net Revenue" } },
      { opposite: true, title: { text: "Number of Sales" } }
    ]
  };

  return (
    <Card>
      <Card.Body>
        <div className="float-end d-none d-md-inline-block">
          <div className="btn-group mb-2">
            {/* <button type="button" className="btn btn-xs btn-light">Today</button>
            <button type="button" className="btn btn-xs btn-light">Weekly</button> */}
            <button type="button" className="btn btn-xs btn-secondary">Monthly</button>
          </div>
        </div>
        <h4 className="header-title mb-3">Sales Analytics</h4>
        <div dir="ltr">
          <Chart options={apexOpts} series={series} type="line" height={380} className="apex-charts mt-4" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalesAnalyticsChart;
