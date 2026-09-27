import { useEffect, useState } from "react";

import {
  getMyAttendance,
  markAttendance,
  checkoutAttendance,
} from "../services/attendanceApi";

import {
  requestOvertime,
} from "../services/overtimeApi";

import AttendanceVerification from "./AttendanceVerification";

// ==========================================
// Get Local Date
// ==========================================

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ==========================================
// Format Time
// ==========================================

const formatTime = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(
    date
  ).toLocaleTimeString();
};

// ==========================================
// Format Working Hours
// ==========================================

const formatWorkingHours = (
  totalMinutes = 0
) => {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

// ==========================================
// Dashboard
// ==========================================

const AttendanceDashboard = () => {
  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [verificationAction, setVerificationAction] =
    useState(null);

  const [showOvertimeForm, setShowOvertimeForm] =
    useState(false);

  const [overtimeMinutes, setOvertimeMinutes] =
    useState("");

  const [overtimeReason, setOvertimeReason] =
    useState("");

  const [overtimeLoading, setOvertimeLoading] =
    useState(false);

  // ==========================================
  // Load Attendance
  // ==========================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyAttendance();

      setAttendance(
        data.attendance || []
      );
    } catch (error) {
      console.error(
        "Attendance fetch error:",
        error
      );

      setError(
        error.message ||
        "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // ==========================================
  // Today's Attendance
  // ==========================================

  const today = getToday();

  const todayAttendance =
    attendance.find(
      (record) =>
        record.date === today
    );

  // ==========================================
  // Start Punch In
  // ==========================================

  const handlePunchIn = () => {
    setSuccess("");
    setError("");

    setVerificationAction(
      "checkin"
    );
  };

  // ==========================================
  // Start Punch Out
  // ==========================================

  const handlePunchOut = () => {
    setSuccess("");
    setError("");

    setVerificationAction(
      "checkout"
    );
  };

  // ==========================================
  // Request Overtime
  // ==========================================

  const handleOvertimeRequest = async () => {
    if (!todayAttendance) {
      setError(
        "You must have attendance for today."
      );
      return;
    }

    if (!todayAttendance.checkOut) {
      setError(
        "Please punch out before requesting overtime."
      );
      return;
    }

    if (!overtimeMinutes || Number(overtimeMinutes) < 1) {
      setError(
        "Please enter valid overtime minutes."
      );
      return;
    }

    if (!overtimeReason.trim()) {
      setError(
        "Please enter overtime reason."
      );
      return;
    }

    try {
      setOvertimeLoading(true);
      setError("");
      setSuccess("");

      await requestOvertime({
        attendanceId: todayAttendance._id,
        date: todayAttendance.date,
        requestedMinutes:
          Number(overtimeMinutes),
        reason: overtimeReason.trim(),
      });

      setSuccess(
        "Overtime request submitted successfully!"
      );

      setOvertimeMinutes("");
      setOvertimeReason("");
      setShowOvertimeForm(false);

      await loadAttendance();
    } catch (error) {
      console.error(
        "Overtime request error:",
        error
      );

      setError(
        error.message ||
        "Failed to request overtime"
      );
    } finally {
      setOvertimeLoading(false);
    }
  };
  // ==========================================
  // Verification Completed
  // ==========================================

  const handleVerificationCapture =
    async ({
      selfie,
      location,
    }) => {
      try {
        setError("");
        setSuccess("");

        if (
          verificationAction ===
          "checkin"
        ) {
          await markAttendance({
            date: today,
            status: "present",
            selfie,
            location,
          });

          setSuccess(
            "Attendance marked successfully!"
          );
        } else {
          await checkoutAttendance({
            date: today,
            selfie,
            location,
          });

          setSuccess(
            "Checkout successful!"
          );
        }

        setVerificationAction(
          null
        );

        await loadAttendance();
      } catch (error) {
        console.error(
          "Attendance action error:",
          error
        );

        setError(
          error.message ||
          "Attendance action failed"
        );
      }
    };

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.reload();
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>
          Loading attendance...
        </h2>
      </div>
    );
  }

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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "48px",
            marginBottom: "8px",
          }}
        >
          My Attendance
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
          }}
        >
          Today:{" "}
          <strong>{today}</strong>
        </p>

        {/* Messages */}

        {error && (
          <div
            style={{
              background: "#3b1111",
              color: "#ff8a8a",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
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
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        {/* Action Buttons */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >
          {!todayAttendance ? (
            <button
              onClick={handlePunchIn}
              style={{
                padding:
                  "14px 24px",
                background:
                  "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              📸 Punch In
            </button>
          ) : (
            <button
              disabled
              style={{
                padding:
                  "14px 24px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            >
              ✓ Attendance Marked
            </button>
          )}

          {todayAttendance &&
            !todayAttendance.checkOut && (
              <button
                onClick={handlePunchOut}
                style={{
                  padding:
                    "14px 24px",
                  background:
                    "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                📸 Punch Out
              </button>
            )}

          {todayAttendance?.checkOut && (
            <button
              disabled
              style={{
                padding:
                  "14px 24px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            >
              ✓ Already Checked Out
            </button>
          )}

          {todayAttendance?.checkOut &&
            todayAttendance?.overtimeStatus !== "approved" && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowOvertimeForm(true);
                }}
                style={{
                  padding: "14px 24px",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ⏱️ Request Overtime
              </button>
            )}

          <button
            onClick={loadAttendance}
            style={{
              padding:
                "14px 24px",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            Refresh
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding:
                "14px 24px",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            Logout
          </button>
        </div>

        {/* Overtime Request Form */}

        {showOvertimeForm && (
          <div
            style={{
              background: "#181b21",
              border: "1px solid #555",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Request Overtime
            </h2>

            <p>
              Date: <strong>{today}</strong>
            </p>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label>
                Overtime Minutes
              </label>

              <input
                type="number"
                min="1"
                value={overtimeMinutes}
                onChange={(e) =>
                  setOvertimeMinutes(
                    e.target.value
                  )
                }
                placeholder="Example: 60"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                  borderRadius: "6px",
                  border: "1px solid #555",
                  background: "#111318",
                  color: "#fff",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label>
                Reason
              </label>

              <textarea
                value={overtimeReason}
                onChange={(e) =>
                  setOvertimeReason(
                    e.target.value
                  )
                }
                placeholder="Explain why you worked overtime..."
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                  borderRadius: "6px",
                  border: "1px solid #555",
                  background: "#111318",
                  color: "#fff",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={handleOvertimeRequest}
                disabled={overtimeLoading}
                style={{
                  padding: "12px 20px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {overtimeLoading
                  ? "Submitting..."
                  : "Submit Request"}
              </button>

              <button
                onClick={() => {
                  setShowOvertimeForm(false);
                  setOvertimeMinutes("");
                  setOvertimeReason("");
                }}
                style={{
                  padding: "12px 20px",
                  background: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Attendance Table */}

        {attendance.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            No attendance records found.
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
                borderCollapse:
                  "collapse",
                background: "#181b21",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Date
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Check In
                  </th>

                  <th style={thStyle}>
                    Check Out
                  </th>

                  <th style={thStyle}>
                    Working Hours
                  </th>

                  <th style={thStyle}>
                    Work Status
                  </th>

                  <th style={thStyle}>
                    Overtime
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.map(
                  (record) => (
                    <tr
                      key={
                        record._id
                      }
                    >
                      <td style={tdStyle}>
                        {
                          record.date
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          record.status
                        }
                      </td>

                      <td style={tdStyle}>
                        {formatTime(
                          record.checkIn
                        )}
                      </td>

                      <td style={tdStyle}>
                        {formatTime(
                          record.checkOut
                        )}
                      </td>

                      <td style={tdStyle}>
                        {formatWorkingHours(
                          record.totalWorkingMinutes
                        )}
                      </td>

                      <td style={tdStyle}>
                        {
                          record.workingStatus ===
                            "completed"
                            ? "Completed"
                            : "Incomplete"
                        }
                      </td>
                      <td style={tdStyle}>
                        {record.overtimeMinutes > 0
                          ? formatWorkingHours(record.overtimeMinutes)
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Camera Verification */}

      {verificationAction && (
        <AttendanceVerification
          action={
            verificationAction
          }
          onCapture={
            handleVerificationCapture
          }
          onCancel={() =>
            setVerificationAction(
              null
            )
          }
        />
      )}
    </div>
  );
};

// ==========================================
// Table Styles
// ==========================================

const thStyle = {
  border: "1px solid #555",
  padding: "14px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #555",
  padding: "14px",
};

export default AttendanceDashboard;