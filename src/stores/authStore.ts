import { makeAutoObservable } from "mobx";
import axios from "axios";

export interface IUser {
	id: number;
	name: string;
	email: string;
	department: number;
	jwtToken: string;
}

class AuthStore {
	user: IUser | null = null;
	jwtToken: string | null = null;
  isLoading = false;
  error: string | null = null;

	constructor() {
		makeAutoObservable(this);
		// Uygulama açıldığında localStorage'dan token ve user bilgisini yükle
		const token = localStorage.getItem("jwtToken");
		if (token) {
			this.jwtToken = token;
		}
		// User bilgisini localStorage'dan yüklemek isterseniz ekleyebilirsiniz
	}

	setUser(user: IUser) {
		this.user = user;
		this.jwtToken = user.jwtToken;
		localStorage.setItem("jwtToken", user.jwtToken);
		// User bilgisini localStorage'a kaydetmek isterseniz ekleyebilirsiniz
	}

	async login(email: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		try {
			const response = await axios.post("http://localhost:5000/api/auth/login", { email });
			if (response.data?.code === "loginSuccess") {
				const user = response.data.payload as IUser;
				this.setUser(user);
				return true;
			}
			this.error = "Giriş başarısız. Lütfen email adresinizi kontrol edin.";
			return false;
		} catch (err: any) {
			this.error = err?.response?.data?.message || "Sunucu hatası";
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	logout() {
		this.user = null;
		this.jwtToken = null;
		localStorage.removeItem("jwtToken");
	}
}

const authStore = new AuthStore();
export default authStore;
