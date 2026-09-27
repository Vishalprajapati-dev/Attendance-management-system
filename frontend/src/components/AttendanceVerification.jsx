import { useEffect, useRef, useState } from "react";

const AttendanceVerification = ({
  action,
  onCapture,
  onCancel,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [location, setLocation] =
    useState(null);

  const [error, setError] = useState("");

  const [capturing, setCapturing] =
    useState(false);

  // ==========================================
  // Start Camera
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        setError("");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: {
                ideal: 640,
              },
              height: {
                ideal: 480,
              },
            },
            audio: false,
          });

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraReady(true);
      } catch (error) {
        console.error(
          "Camera Error:",
          error
        );

        setError(
          "Camera permission is required. Please allow camera access."
        );
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  // ==========================================
  // Get Location
  // ==========================================

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },

        () => {
          reject(
            new Error(
              "Location permission is required. Please allow location access."
            )
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // ==========================================
  // Capture Selfie
  // ==========================================

  const captureSelfie = () => {
    if (
      !videoRef.current ||
      !canvasRef.current
    ) {
      throw new Error(
        "Camera is not ready."
      );
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const maxWidth = 640;

    const scale =
      Math.min(
        1,
        maxWidth / video.videoWidth
      );

    canvas.width =
      video.videoWidth * scale;

    canvas.height =
      video.videoHeight * scale;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Compressed JPEG
    return canvas.toDataURL(
      "image/jpeg",
      0.7
    );
  };

  // ==========================================
  // Verify & Capture
  // ==========================================

  const handleCapture = async () => {
    try {
      setCapturing(true);
      setError("");

      if (!cameraReady) {
        throw new Error(
          "Camera is not ready yet."
        );
      }

      // Get current location
      const currentLocation =
        await getLocation();

      // Capture live selfie
      const selfie =
        captureSelfie();

      // Send data to parent
      onCapture({
        selfie,
        location: currentLocation,
      });
    } catch (error) {
      console.error(
        "Verification Error:",
        error
      );

      setError(
        error.message ||
          "Unable to capture verification data."
      );
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <h2>
          {action === "checkin"
            ? "Punch In Verification"
            : "Punch Out Verification"}
        </h2>

        <p>
          Allow camera and location access.
        </p>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "cover",
            borderRadius: "10px",
            background: "#000",
          }}
        />

        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "12px",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onCancel}
            disabled={capturing}
            style={{
              flex: 1,
              padding: "12px",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleCapture}
            disabled={
              capturing || !cameraReady
            }
            style={{
              flex: 1,
              padding: "12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
          >
            {capturing
              ? "Verifying..."
              : "Capture & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceVerification;