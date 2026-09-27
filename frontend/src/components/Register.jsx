import { useState } from "react";

const API_URL = "http://localhost:5000/api/auth/register";

function Register({ onRegisterSuccess, onGoToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim() || !email.trim() || !password) {
            setError("Name, email and password are required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            // 1. CREATE ACCOUNT
            const registerResponse = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    role: "employee",
                }),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok || !registerData.success) {
                throw new Error(
                    registerData.message || "Registration failed"
                );
            }

            // 2. AUTOMATIC LOGIN AFTER REGISTRATION
            const loginResponse = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const loginData = await loginResponse.json();

            if (!loginResponse.ok || !loginData.success) {
                throw new Error(
                    loginData.message ||
                    "Account created, but automatic login failed"
                );
            }

            // 3. SEND LOGIN DATA TO APP
            if (onRegisterSuccess) {
                onRegisterSuccess(loginData);
            }

            // Clear form
            setName("");
            setEmail("");
            setPassword("");

        } catch (error) {
            console.error("Registration Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f6f9",
                padding: "20px",
            }}
        >
            <form
                onSubmit={handleRegister}
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    background: "#ffffff",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
                    Create Employee Account
                </h2>

                {error && (
                    <p
                        style={{
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "10px",
                            borderRadius: "6px",
                        }}
                    >
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        style={{
                            color: "#166534",
                            background: "#dcfce7",
                            padding: "10px",
                            borderRadius: "6px",
                        }}
                    >
                        {success}
                    </p>
                )}

                <label>Name</label>

                <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "12px",
                        margin: "8px 0 16px",
                        boxSizing: "border-box",
                    }}
                />

                <label>Email</label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "12px",
                        margin: "8px 0 16px",
                        boxSizing: "border-box",
                    }}
                />

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                        width: "100%",
                        padding: "12px",
                        margin: "8px 0 16px",
                        boxSizing: "border-box",
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                    }}
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                    }}
                >
                    <span style={{ color: "#555" }}>
                        Already have an account?{" "}
                    </span>

                    <button
                        type="button"
                        onClick={onGoToLogin}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            cursor: "pointer",
                            fontWeight: "600",
                            padding: 0,
                        }}
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;