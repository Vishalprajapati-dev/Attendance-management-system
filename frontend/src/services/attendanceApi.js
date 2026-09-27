const API_BASE_URL =
  "https://attendance-management-system-nca7.onrender.com";

// ==========================================
// Get Token
// ==========================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ==========================================
// Common Request
// ==========================================

const attendanceRequest = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please login."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
};

// ==========================================
// Get My Attendance
// ==========================================

export const getMyAttendance = async () => {
  return attendanceRequest("/my", {
    method: "GET",
  });
};

// ==========================================
// Punch In
// ==========================================

export const markAttendance = async ({
  date,
  status = "present",
  selfie,
  location,
}) => {
  return attendanceRequest("/mark", {
    method: "POST",

    body: JSON.stringify({
      date,
      status,
      selfie,
      location,
    }),
  });
};

// ==========================================
// Punch Out
// ==========================================

export const checkoutAttendance = async ({
  date,
  selfie,
  location,
}) => {
  return attendanceRequest("/checkout", {
    method: "POST",

    body: JSON.stringify({
      date,
      selfie,
      location,
    }),
  });
};

// ==========================================
// ADMIN / MANAGER - GET ALL ATTENDANCE
// ==========================================

export const getAllAttendance = async () => {
  return attendanceRequest("/all", {
    method: "GET",
  });
};

// ==========================================
// ADMIN / MANAGER - VERIFY ATTENDANCE
// ==========================================

export const verifyAttendance = async ({
  attendanceId,
  status,
  remarks,
}) => {
  return attendanceRequest(
    `/${attendanceId}/verify`,
    {
      method: "PATCH",

      body: JSON.stringify({
        status,
        remarks,
      }),
    }
  );
};