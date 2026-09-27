import { useEffect, useState } from "react";

const API_URL = "https://attendance-management-system-nca7.onrender.com/api/attendance";

const AdminAttendance = ({ onLogout }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // LOAD ALL ATTENDANCE
  // ==========================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load attendance"
        );
      }

      setAttendance(data.attendance || []);
    } catch (error) {
      console.error("Attendance loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // ==========================================
  // VERIFY ATTENDANCE
  // ==========================================

  const verifyAttendance = async (id, status) => {
    try {
      setError("");
      setSuccess("");

      // Ask admin for remark
      const remarks = window.prompt(
        `Enter remark for ${status === "valid" ? "valid" : "invalid"} attendance:`
      );

      // If admin presses Cancel
      if (remarks === null) {
        return;
      }

      // Empty remark check
      if (!remarks.trim()) {
        setError("Please enter a remark.");
        return;
      }

      const response = await fetch(
        `${API_URL}/${id}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Verification failed"
        );
      }

      setSuccess(
        `Attendance marked as ${status} successfully.`
      );

      // Update current row immediately
      setAttendance((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
              ...item,
              attendanceVerification:
                data.attendance.attendanceVerification,
            }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Attendance verification error:",
        error
      );

      setError(error.message);
    }
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  // ==========================================
  // GENERATE DAILY ATTENDANCE REPORT
  // ==========================================

  const generateDailyReport = () => {
    const today = new Date().toISOString().split("T")[0];

    const todayRecords = attendance.filter(
      (item) => item.date === today
    );

    if (todayRecords.length === 0) {
      alert("No attendance records found for today.");
      return;
    }

    const reportWindow = window.open(
      "",
      "_blank",
      "width=1400,height=900"
    );

    if (!reportWindow) {
      alert("Please allow pop-ups to generate the report.");
      return;
    }

    const rows = todayRecords
      .map((item) => {
        const workingMinutes = item.totalWorkingMinutes || 0;

        const workingHours =
          `${Math.floor(workingMinutes / 60)}h ${workingMinutes % 60}m`;

        const location = item.checkInLocation
          ? `Lat: ${item.checkInLocation.latitude ?? "-"}<br/>
           Lng: ${item.checkInLocation.longitude ?? "-"}`
          : "No location";

        const selfie = item.checkInSelfie
          ? `<img src="${item.checkInSelfie}"
             style="width:80px;height:80px;object-fit:cover;border-radius:8px;" />`
          : "No selfie";

        const workStatus =
          workingMinutes >= 480
            ? "Completed"
            : "Incomplete";

        return `
        <tr>
          <td>${item.employee?.name || "-"}</td>
          <td>${formatTime(item.checkIn)}</td>
          <td>${formatTime(item.checkOut)}</td>
          <td>${selfie}</td>
          <td>${location}</td>
          <td>${workingHours}</td>
          <td>${workStatus}</td>
        </tr>
      `;
      })
      .join("");

    reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Attendance Report - ${today}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }

          h1 {
            text-align: center;
            margin-bottom: 5px;
          }

          .date {
            text-align: center;
            margin-bottom: 25px;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 10px;
            text-align: center;
            vertical-align: middle;
          }

          th {
            background: #222;
            color: white;
          }

          img {
            display: block;
            margin: auto;
          }

          .print-btn {
            display: block;
            margin: 0 auto 25px;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            background: #2563eb;
            color: white;
            cursor: pointer;
            font-size: 15px;
          }

          @media print {
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>

      <body>

        <button
          class="print-btn"
          onclick="window.print()"
        >
          Print / Save Report
        </button>

        <h1>Daily Attendance Report</h1>

        <div class="date">
          Date: ${today}
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Selfie</th>
              <th>Location</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

      </body>
    </html>
  `);

    reportWindow.document.close();
  };
  // ==========================================
  // UI
  // ==========================================

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
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Attendance Verification
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: "30px",
          }}
        >
          Admin / Manager Attendance Verification Panel
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "25px",
          }}
        >
          <button
            onClick={loadAttendance}
            style={buttonStyle}
          >
            Refresh
          </button>

          <button
            onClick={generateDailyReport}
            style={{
              ...buttonStyle,
              background: "#2563eb",
              color: "#fff",
            }}
          >
            Daily Report
          </button>

          <button
            onClick={onLogout}
            style={logoutStyle}
          >
            Logout
          </button>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {success && (
          <div style={successStyle}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={messageStyle}>
            Loading attendance...
          </div>
        ) : attendance.length === 0 ? (
          <div style={messageStyle}>
            No attendance records found.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              background: "#181b21",
              borderRadius: "10px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Check In</th>
                  <th style={thStyle}>Check Out</th>
                  <th style={thStyle}>Working</th>
                  <th style={thStyle}>Selfie</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Verification</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => {
                  const verification =
                    item.attendanceVerification
                      ?.status || "pending";

                  return (
                    <tr key={item._id}>
                      <td style={tdStyle}>
                        {item.employee?.name || "-"}
                      </td>

                      <td style={tdStyle}>
                        {item.employee?.email || "-"}
                      </td>

                      <td style={tdStyle}>
                        {item.date}
                      </td>

                      <td style={tdStyle}>
                        {item.status}
                      </td>

                      <td style={tdStyle}>
                        {formatTime(item.checkIn)}
                      </td>

                      <td style={tdStyle}>
                        {formatTime(item.checkOut)}
                      </td>

                      <td style={tdStyle}>
                        {Math.floor(
                          (item.totalWorkingMinutes || 0) /
                          60
                        )}
                        h{" "}
                        {(item.totalWorkingMinutes || 0) %
                          60}
                        m
                      </td>

                      <td style={tdStyle}>
                        {item.checkInSelfie ? (
                          <img
                            src={item.checkInSelfie}
                            alt="Employee Selfie"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          "No selfie"
                        )}
                      </td>

                      <td style={tdStyle}>
                        {item.checkInLocation ? (
                          <>
                            <div>
                              Lat: {item.checkInLocation.latitude ?? "-"}
                            </div>
                            <div>
                              Lng: {item.checkInLocation.longitude ?? "-"}
                            </div>
                          </>
                        ) : (
                          "No location"
                        )}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            background:
                              verification === "valid"
                                ? "#14532d"
                                : verification ===
                                  "invalid"
                                  ? "#7f1d1d"
                                  : "#713f12",
                          }}
                        >
                          {verification}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() =>
                            verifyAttendance(
                              item._id,
                              "valid"
                            )
                          }
                          style={approveStyle}
                        >
                          Valid
                        </button>

                        <button
                          onClick={() =>
                            verifyAttendance(
                              item._id,
                              "invalid"
                            )
                          }
                          style={rejectStyle}
                        >
                          Invalid
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// STYLES
// ==========================================

const thStyle = {
  border: "1px solid #444",
  padding: "12px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  border: "1px solid #444",
  padding: "12px",
  whiteSpace: "nowrap",
};

const buttonStyle = {
  padding: "11px 20px",
  borderRadius: "7px",
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
};

const logoutStyle = {
  ...buttonStyle,
  background: "#dc3545",
  color: "#fff",
};

const approveStyle = {
  padding: "7px 12px",
  marginRight: "6px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const rejectStyle = {
  padding: "7px 12px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const errorStyle = {
  background: "#3b1111",
  color: "#ff8a8a",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
  textAlign: "center",
};

const successStyle = {
  background: "#103b20",
  color: "#7dffab",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
  textAlign: "center",
};

const messageStyle = {
  background: "#181b21",
  padding: "30px",
  borderRadius: "10px",
  textAlign: "center",
};

export default AdminAttendance;