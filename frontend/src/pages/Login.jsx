import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import "./login.css";

export default function Login() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });
            setAuth(res.data);
            // Check user's role and redirect accordingly
            const userData = res.data.user;
            const isSuperAdmin = userData?.organizations?.some(org => org.role === "SUPER_ADMIN");
            const isOrgAdmin = userData?.organizations?.some(org => org.role === "ORG_ADMIN");

            if (isSuperAdmin) {
                // Platform super admin goes directly to admin apps page
                navigate("/admin/apps");
            } else if (isOrgAdmin) {
                // Organization admin goes to organization selector
                navigate("/organizations");
            } else {
                // If user is only a regular user (USER role), go to the tenant selection
                navigate("/tenant");
            }
        } catch (error) {
            setErr("Invalid email or password");
            toast.error("Invalid email or password");
            console.error("Login error:", error); // Keep console.error for debugging purposes
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={submit}>
                <h2>Login</h2>

                {err && <div className="login-error">{err}</div>}

                <input
                    className="login-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                />

                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                <button className="login-btn" type="submit">
                    Sign In
                </button>
            </form>
        </div>
    );
}
