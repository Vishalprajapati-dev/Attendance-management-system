import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/overtime";

const AdminOvertime = ({ onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // ==============================
  // Get Pending Overtime Requests
  // ==============================
  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/pending`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load requests");
      }

      setRequests(data.overtime || []);
    } catch (error) {
      console.error("Pending overtime error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  // ==============================
  // Approve / Reject
  // ==============================
  const updateStatus = async (id, status) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update overtime");
      }

      setSuccess(
        `Overtime ${status} successfully`
      );

      // Remove processed request from pending list
      setRequests((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Update overtime error:", error);
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111318",
        color: "#fff",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Overtime Requests
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: "30px",
          }}
        >
          Admin / Manager Approval Panel
        </p>
        <button
          onClick={onLogout}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#dc3545",
            color: "#fff",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          Logout
        </button>

        {error && (
          <div
            style={{
              background: "#3b1111",
              color: "#ff8a8a",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#103b20",
              color: "#7dffab",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        <button
          onClick={loadPendingRequests}
          style={{
            padding: "12px 20px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>

        {loading ? (
          <h3>Loading overtime requests...</h3>
        ) : requests.length === 0 ? (
          <div
            style={{
              background: "#181b21",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            No pending overtime requests.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#181b21",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Minutes</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td style={tdStyle}>
                      {request.employee?.name || "-"}
                    </td>

                    <td style={tdStyle}>
                      {request.employee?.email || "-"}
                    </td>

                    <td style={tdStyle}>
                      {request.date}
                    </td>

                    <td style={tdStyle}>
                      {request.requestedMinutes} min
                    </td>

                    <td style={tdStyle}>
                      {request.reason}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          updateStatus(
                            request._id,
                            "approved"
                          )
                        }
                        style={approveStyle}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            request._id,
                            "rejected"
                          )
                        }
                        style={rejectStyle}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  border: "1px solid #555",
  padding: "14px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #555",
  padding: "14px",
};

const approveStyle = {
  padding: "8px 14px",
  marginRight: "8px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const rejectStyle = {
  padding: "8px 14px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default AdminOvertime;