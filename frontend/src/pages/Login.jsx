import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
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
            navigate("/tenant");
        } catch {
            setErr("Invalid email or password");
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
                />

                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="login-btn">
                    Sign In
                </button>
            </form>
        </div>
    );
}
