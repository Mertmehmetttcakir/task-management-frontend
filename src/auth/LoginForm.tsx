import React from "react";
import { observer } from "mobx-react";
import { authStore } from "../stores/authStore";
import "../styles/index.css";

const LoginForm: React.FC = observer(() => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await authStore.loginAsync();
    };

    if (authStore.isLoggedIn) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <h2 className="auth-title">Hoş geldiniz 👋</h2>
                    <p className="auth-subtitle">{authStore.email}</p>
                    <div className="auth-actions">
                        <button className="btn btn-danger" onClick={() => authStore.logout()}>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">TM</div>
                    <div>
                        <h2 className="auth-title">Task Manager</h2>
                        <p className="auth-subtitle">Hesabınıza giriş yapın</p>
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="input-label">Email</label>
                    <div className="input-field">
                        <span className="input-icon">@</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={authStore.email}
                            onChange={(e) => (authStore.email = e.target.value)}
                            required
                            disabled={authStore.isLoading}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={authStore.rememberMe}
                            onChange={(e) => (authStore.rememberMe = e.target.checked)}
                            disabled={authStore.isLoading}
                        />
                        <label htmlFor="remember-me" className="input-label">Beni hatırla</label>
                    </div>

                    {authStore.error && (
                        <div className="auth-error">{authStore.error}</div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={authStore.isLoading}>
                        {authStore.isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                <div className="auth-footer">
                </div>
            </div>
        </div>
    );
});

export default LoginForm;
