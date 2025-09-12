import { observer } from "mobx-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authStore from "../stores/authStore";

const Login = observer(() => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const ok = await authStore.login(email);
    if (ok) {
      navigate("/tasks");
    }
  };

  return (
    <div className="login-container">
      <h2>Task Management Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            disabled={authStore.isLoading}
            required
          />
        </div>
        {authStore.error && (
          <div className="error-message">{authStore.error}</div>
        )}
        <button
          type="submit"
          disabled={authStore.isLoading || !email}
          className="login-button"
        >
          {authStore.isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
});

export default Login;