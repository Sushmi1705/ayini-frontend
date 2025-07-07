import { Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

// components
import { FormInput } from "@/components";
import AuthLayout from "./AuthLayout";

/* bottom link */
const BottomLink = () => {
  const { t } = useTranslation();
  return (
    <Row className="mt-3">
      <Col className="text-center">
        <p className="text-white-50">
          {t("Back to")}{" "}
          <Link to={"/auth/login"} className="text-white ms-1">
            <b>{t("Log in")}</b>
          </Link>
        </p>
      </Col>
    </Row>
  );
};

const ForgetPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
      setError(null);
    } catch (err) {
      console.error("Password reset error:", err);
      setMessage(null);
      setError(err.message || "Failed to send reset email.");
    }
  };

  return (
    <AuthLayout
      helpText={t(
        "Enter your email address and we'll send you an email with instructions to reset your password."
      )}
      bottomLinks={<BottomLink />}
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          label={t("Email")}
          type="email"
          name="email"
          placeholder={t("Enter your email")}
          containerClass={"mb-3"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <div className="text-success mb-3 text-center">{message}</div>}
        {error && <div className="text-danger mb-3 text-center">{error}</div>}

        <div className="d-grid text-center">
          <Button variant="primary" type="submit">
            {t("Reset Password")}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;
