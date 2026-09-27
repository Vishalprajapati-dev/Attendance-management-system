const API_URL = "http://localhost:5000/api/overtime";

// Get token
const getToken = () => {
  return localStorage.getItem("token");
};

// Request overtime
export const requestOvertime = async ({
  attendanceId,
  date,
  requestedMinutes,
  reason,
}) => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attendanceId,
        date,
        requestedMinutes: Number(
          requestedMinutes
        ),
        reason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to request overtime"
    );
  }

  return data;
};

// Get my overtime
export const getMyOvertime = async () => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch overtime"
    );
  }

  return data;
}; 