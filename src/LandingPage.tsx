import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup";

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg =
          typeof errorData.message === "string"
            ? errorData.message
            : errorData.message?.message || "Auth failed";
        throw new Error(msg);
      }

      const json = await res.json();

      if (mode === "signup") {
        //Show inline success message
        setSuccessMessage("Signup successful! Redirecting to login...");
        setErrorMessage(null);

        //Switch form back to login mode after short delay
        setTimeout(() => {
          setMode("login");
          setSuccessMessage(null);
        }, 1500);

        return;
      }

      // Login flow
      const { access_token, role, merchantId, employeeId } = json;
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      if (role === "merchant") {
        localStorage.setItem("merchantId", merchantId);
        navigate(`/merchants/${merchantId}/tips/summary`);
      } else if (role === "employee") {
        localStorage.setItem("employeeId", employeeId);
        navigate(`/employees/${employeeId}/tips`);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>{mode === "login" ? "Welcome To Ecom payments" : "Create Your Account"}</h1>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input name="name" type="text" placeholder="Full Name" className="input" />
          )}
          <input name="email" type="email" placeholder="Email" className="input" />
          <input name="password" type="password" placeholder="Password" className="input" />
          {mode === "signup" && (
            <select name="role" className="input">
              <option value="merchant">Merchant</option>
            </select>
          )}
          <button type="submit" className="button">
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {/*Inline messages */}
        {successMessage && <p className="success">{successMessage}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}

        <p className="toggle">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button type="button" onClick={() => setMode("signup")} className="link">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="link">
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;