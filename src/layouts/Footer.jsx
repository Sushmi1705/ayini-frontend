import React from "react";
import { Row, Col } from "react-bootstrap";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <React.Fragment>
      <footer className="footer">
        <div className="container-fluid">
          <Row>
            <Col md={6}>
              <div className="text-muted small">{currentYear} Sri Ayini admin console</div>
            </Col>

            <Col md={6}>
              <div className="d-none d-md-flex gap-4 align-item-center justify-content-md-end footer-links text-muted small">
                <span>Orders</span>
                <span>Catalog</span>
                <span>Customers</span>
              </div>
            </Col>
          </Row>
        </div>
      </footer>
    </React.Fragment>;
};
export default Footer;
