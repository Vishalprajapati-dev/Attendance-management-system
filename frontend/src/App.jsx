import { useState } from "react";

import Login from "./components/Login";
import Register from "./components/Register";

import AttendanceDashboard from "./components/AttendanceDashboard";
import AdminOvertime from "./components/AdminOvertime";
import AdminAttendance from "./components/AdminAttendance";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  // Login / Register page control
  const [authPage, setAuthPage] = useState("login");

  const [adminPage, setAdminPage] = useState("attendance");

  // Get logged-in user
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  // ---------------------------------------
  // LOGIN SUCCESS
  // ---------------------------------------
  const handleLogin = (userData) => {
    console.log("LOGIN DATA:", userData);

    if (!userData?.token) {
      console.error("Login response does not contain token");
      return;
    }

    localStorage.setItem("token", userData.token);

    if (userData.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(userData.user)
      );
    }

    setIsLoggedIn(true);
  };

  // ---------------------------------------
  // LOGOUT
  // ---------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setAuthPage("login");
  };

  // ---------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------
  if (!isLoggedIn) {
    // REGISTER PAGE
    if (authPage === "register") {
      return (
        <Register
          onRegisterSuccess={(userData) => {
            handleLogin(userData);
          }}
          onGoToLogin={() => {
            setAuthPage("login");
          }}
        />
      );
    }

    // LOGIN PAGE
    return (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => {
          setAuthPage("register");
        }}
      />
    );
  }

  // ---------------------------------------
  // GET USER
  // ---------------------------------------
  const user = getUser();

  // ---------------------------------------
  // TOKEN EXISTS BUT USER IS MISSING
  // ---------------------------------------
  if (!user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    return null;
  }

  // ---------------------------------------
  // ADMIN / MANAGER
  // ---------------------------------------
  if (
    user.role === "admin" ||
    user.role === "manager"
  ) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            padding: "15px",
            background: "#111318",
          }}
        >
          <button
            onClick={() => setAdminPage("attendance")}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Attendance Verification
          </button>

          <button
            onClick={() => setAdminPage("overtime")}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Overtime Requests
          </button>
        </div>

        {adminPage === "attendance" ? (
          <AdminAttendance
            onLogout={handleLogout}
          />
        ) : (
          <AdminOvertime
            onLogout={handleLogout}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------
  // EMPLOYEE
  // ---------------------------------------
  return (
    <AttendanceDashboard
      onLogout={handleLogout}
    />
  );
}

export default App;