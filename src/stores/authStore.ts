import axios from "axios";
import { makeAutoObservable } from "mobx";

interface LoginPayload {
    id: number;
    name: string;
    email: string;
    department: number;
    jwtToken: string;
}

class AuthStore {
    constructor() {
        makeAutoObservable(this);
        // Try to restore persisted session if available
        this.hydrateFromStorage();
    }

    email: string = "";
    isLoggedIn: boolean = false;
    error: string = "";
    isLoading: boolean = false;
    token: string = "";
    userId: number | null = null;
    name: string = "";
    department: number | null = null;
    rememberMe: boolean = false;

    private storageKey = "tm.auth.session";

    // helpers as arrow actions
    private setLoading = (v: boolean) => {
        this.isLoading = v;
    };

    private applyLoginSuccess = (payload: LoginPayload) => {
        this.token = payload?.jwtToken ?? "";
        this.userId = payload?.id ?? null;
        this.name = payload?.name ?? "";
        this.department = payload?.department ?? null;
        this.isLoggedIn = !!this.token;
        this.error = "";
        if (this.token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
        }
        // Persist session if user opted-in
        if (this.rememberMe && this.isLoggedIn) {
            this.persistToStorage();
        } else {
            this.clearPersisted();
        }
    };

    private applyLoginError = (msg: string) => {
        this.error = msg;
        this.isLoggedIn = false;
        this.token = "";
        this.userId = null;
        this.name = "";
        this.department = null;
        delete axios.defaults.headers.common["Authorization"];
    };

    private persistToStorage = () => {
        try {
            const data = {
                token: this.token,
                email: this.email,
                userId: this.userId,
                name: this.name,
                department: this.department,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch {}
    };

    private clearPersisted = () => {
        try {
            localStorage.removeItem(this.storageKey);
        } catch {}
    };

    private hydrateFromStorage = () => {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return;
            const data = JSON.parse(raw) as Partial<LoginPayload> & {
                token?: string;
                userId?: number;
                name?: string;
                department?: number;
                email?: string;
            };
            if (data?.token) {
                this.token = data.token;
                this.isLoggedIn = true;
                this.userId = data.userId ?? null;
                this.name = data.name ?? "";
                this.department = data.department ?? null;
                this.email = data.email ?? this.email;
                this.rememberMe = true;
                axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
            }
        } catch {}
    };

    loginAsync = async () => {
        this.setLoading(true);
        this.error = "";
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email: this.email,
            });
            const payload: LoginPayload = response?.data?.payload;
            this.applyLoginSuccess(payload);
        } catch (error: any) {
            this.applyLoginError("Email adresi bulunamadı.");
        } finally {
            this.setLoading(false);
        }
    };

    logout = () => {
        this.isLoggedIn = false;
        this.token = "";
        this.email = "";
        this.error = "";
        this.userId = null;
        this.name = "";
        this.department = null;
        this.rememberMe = false;
        delete axios.defaults.headers.common["Authorization"];
        this.clearPersisted();
    };
}

export const authStore = new AuthStore();
