import axios from "axios";
import { makeAutoObservable ,runInAction } from "mobx";

class AuthStore {
    email: string = "";
    password: string = "";
    isLoggedIn: boolean = false;
    error: string = "";
    isLoading: boolean = false;
    token: string = "";

    constructor() {
        makeAutoObservable(this);
    }

    async loginAsync() {
        this.isLoading = true;
        this.error = "";

        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email: this.email,
                password: this.password,
            });

            runInAction(() => {
                this.token = response.data.token;
                this.isLoggedIn = true;
                this.error = "";
            });
        } catch (error: any) {
            runInAction(() => {
                this.error = error?.response?.data?.message ?? "Login failed";
                this.isLoggedIn = false;
                this.token = "";
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    logout() {
        this.isLoggedIn = false;
        this.token = "";
        this.email = "";
        this.password = "";
        this.error = "";
    }
}

export const authStore = new AuthStore();
