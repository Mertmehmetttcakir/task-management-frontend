import { makeAutoObservable } from "mobx";

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

	logout() {
		this.user = null;
		this.jwtToken = null;
		localStorage.removeItem("jwtToken");
	}
}

const authStore = new AuthStore();
export default authStore;
