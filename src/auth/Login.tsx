import { observer } from "mobx-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authStore from "../stores/authStore";
import axios from "axios";
// ...existing code...
const Login = observer(() => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleLogin = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await axios.post("http://localhost:5000/api/auth/login", { email });
			if (response.data?.code === "loginSuccess") {
				const user = response.data.payload;
				// JWT token'ı localStorage'a kaydet
				localStorage.setItem("jwtToken", user.jwtToken);
				// authStore'a kullanıcı bilgisini kaydet (örnek)
				if (authStore) {
					authStore.setUser(user);
				}
				navigate("/tasks"); // başarılı login sonrası yönlendirme
			} else {
				setError("Giriş başarısız. Lütfen email adresinizi kontrol edin.");
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Sunucu hatası");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<h2>Task Management Login</h2>
			<form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
				<div className="form-group">
					<label htmlFor="email">Email:</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
						disabled={loading}
						required
					/>
				</div>
				{error && <div className="error-message">{error}</div>}
				<button
					type="submit"
					disabled={loading || !email}
					className="login-button"
				>
					{loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
				</button>
			</form>
		</div>
	);
});

export default Login;