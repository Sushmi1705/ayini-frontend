import { Button, Col, Row, FormControl, FormGroup, FormLabel, Alert } from "react-bootstrap";
import AuthLayout from "./AuthLayout";
import useLogin from "@/hooks/useLogin.js";

const Login = () => {
  const {
    loading,
    step,
    method,
    identifier,
    otp,
    error,
    successMessage,
    adminConfig,
    setIdentifier,
    setOtp,
    chooseMethod,
    sendOtp,
    verifyOtp,
    backToChoose,
    backToRequest,
  } = useLogin();

  return (
    <AuthLayout helpText="Single-admin access only. Sign in with OTP using the approved admin email or mobile number.">
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {step === "choose" && (
        <div className="d-grid gap-3">
          <Button variant="primary" onClick={() => chooseMethod("email")}>
            Continue with admin email
          </Button>
          <Button variant="outline-primary" onClick={() => chooseMethod("phone")}>
            Continue with admin mobile
          </Button>
          <div className="text-muted small text-center mt-2">
            Allowed email: <strong>{adminConfig.email}</strong>
            <br />
            Allowed mobile: <strong>{adminConfig.phone}</strong>
          </div>
        </div>
      )}

      {step === "request" && (
        <div>
          <FormGroup className="mb-3">
            <FormLabel>{method === "email" ? "Admin Email" : "Admin Mobile"}</FormLabel>
            <FormControl
              type={method === "email" ? "email" : "text"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </FormGroup>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            <Button variant="light" onClick={backToChoose} disabled={loading}>
              Back
            </Button>
          </div>
        </div>
      )}

      {step === "verify" && (
        <form onSubmit={verifyOtp}>
          <FormGroup className="mb-3">
            <FormLabel>{method === "email" ? "Admin Email" : "Admin Mobile"}</FormLabel>
            <FormControl value={identifier} disabled />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>OTP</FormLabel>
            <FormControl
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter 6-digit OTP"
            />
          </FormGroup>
          <Row className="g-2">
            <Col xs={12}>
              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </Col>
            <Col xs={6}>
              <div className="d-grid">
                <Button variant="light" onClick={backToRequest} disabled={loading}>
                  Change
                </Button>
              </div>
            </Col>
            <Col xs={6}>
              <div className="d-grid">
                <Button variant="outline-primary" onClick={sendOtp} disabled={loading}>
                  Resend OTP
                </Button>
              </div>
            </Col>
          </Row>
        </form>
      )}
    </AuthLayout>
  );
};

export default Login;
