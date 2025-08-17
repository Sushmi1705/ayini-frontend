import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { getAllCustomers, deleteCustomer } from "../../../services/userService";
import PageTitle from "../../../components/PageTitle";
import { useTable, useExpanded } from "react-table";
import "../../../assets/scss/customer.scss";


const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDateAndTime = (timestamp) => {
    if (!timestamp || !("_seconds" in timestamp)) return { date: "N/A", time: "" };
    const dateObj = new Date(timestamp._seconds * 1000);
    return {
      date: dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const fetchCustomers = async () => {
    try {
      const res = await getAllCustomers();
      const customersWithAddresses = res.map((cust) => ({
        ...cust,
        addresses: cust.addresses || [],
        phone: cust.contact || "N/A",
        name: cust.firstName + " " + cust.lastName || "Unknown",
        orders: cust.totalOrders || 0,
        last_order: formatDateAndTime(cust.lastOrder),
        status: "Active",
        avatar: "https://via.placeholder.com/40",
      }));
      setCustomers(customersWithAddresses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns = useMemo(
    () => [
      // {
      //   Header: "Customer",
      //   accessor: "name",
      //   Cell: ({ row }) => (
      //     <div className="d-flex align-items-center">
      //       <img src="../../assets/images/avatar.jpeg" alt="Avatar" className="rounded-circle me-2" width="40" height="40" />
      //       {/* {row.original.name} */}
      //     </div>
      //   ),
      // },
      { Header: "Phone", accessor: "phone" },
      { Header: "Orders", accessor: "totalOrders" },
      {
        Header: "Last Order",
        accessor: "lastOrder",
        Cell: ({ row }) => (
          <>
            {row.original.last_order.date} <small className="text-muted">{row.original.last_order.time}</small>
          </>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => (
          <Badge bg={row.original.status === "Active" ? "success" : "danger"}>{row.original.status}</Badge>
        ),
      },
      {
        // For expanding rows
        id: "expander",
        Cell: ({ row }) => (
          <span {...row.getToggleRowExpandedProps()} style={{ cursor: "pointer" }}>
            {row.isExpanded ? "▼" : "▶"}
          </span>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => customers, [customers]);

  const tableInstance = useTable({ columns, data }, useExpanded);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <>
      <PageTitle
        title="Customers"
        breadCrumbItems={[
          { label: "Ecommerce", path: "/apps/ecommerce/customers" },
          { label: "Customers", path: "/apps/ecommerce/customers", active: true },
        ]}
      />

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <table className="table table-striped dt-responsive w-100" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <React.Fragment key={row.original.id}>
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                  {row.isExpanded ? (
                    <tr>
                      <td colSpan={columns.length}>
                        {row.original.addresses && row.original.addresses.length > 0 ? (
                          row.original.addresses.map((addr) => (
                            <Card key={addr.id} className="mb-2 p-2 shadow-sm">
                              <p>
                                <strong>
                                  {addr.firstName} {addr.lastName}
                                </strong>
                              </p>
                              <p>{addr.company}</p>
                              <p>{addr.email}</p>
                              <p>
                                {addr.address}, {addr.city}, {addr.country} - {addr.postalCode}
                              </p>
                              <p>Phone: {addr.phone}</p>
                            </Card>
                          ))
                        ) : (
                          <p className="text-muted">No addresses created yet.</p>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};

export default Customers;
