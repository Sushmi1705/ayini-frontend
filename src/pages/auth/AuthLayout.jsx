import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import LogoDark from "@/assets/images/logo-dark.png";
import LogoLight from "@/assets/images/logo-light.png";
const AuthLayout = ({
  helpText,
  bottomLinks,
  children,
  isCombineForm
}) => {
  useEffect(() => {
    if (document.body) document.body.classList.add("authentication-bg", "authentication-bg-pattern");
    return () => {
      if (document.body) document.body.classList.remove("authentication-bg", "authentication-bg-pattern");
    };
  }, []);
  return <>
      <div className="account-pages mt-5 mb-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={isCombineForm ? 9 : 4}>
              <Card className="bg-pattern admin-auth-card border-0 shadow-lg">
                <Card.Body className="p-4">
                  <div className="text-center w-75 m-auto">
                    <div className="auth-brand">
                      <a href="/auth/login" className="logo logo-dark text-center">
                        <span className="logo-lg">
                          <img src={LogoDark} alt="" height="22" />
                        </span>
                      </a>

                      <a href="/auth/login" className="logo logo-light text-center">
                        <span className="logo-lg">
                          <img src={LogoLight} alt="" height="22" />
                        </span>
                      </a>
                    </div>
                    <div className="admin-auth-kicker">Secure Admin Access</div>
                    <h3 className="admin-auth-title">Sri Ayini Control Room</h3>
                    <p className="text-muted mb-4 mt-3">{helpText}</p>
                  </div>
                  {children}
                </Card.Body>
              </Card>

              {/* bottom links */}
              {bottomLinks}
            </Col>
          </Row>
        </Container>
      </div>

      <footer className="footer footer-alt">
        {new Date().getFullYear()} &copy; Sri Ayini admin access
      </footer>
    </>;
};
export default AuthLayout;
