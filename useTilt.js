import { useEffect, useState } from "react";

const permissionKey = "motionPermissionGranted";

export function isPermissionGranted() {
  return localStorage.getItem(permissionKey) === "true";
}

export function requestPermissions(callback) {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    const permissionButton = document.createElement("button");
    permissionButton.textContent = "Request Motion Permission";
    const buttonStyle = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "16px",
      padding: "12px 24px",
      borderRadius: "8px",
    };
    Object.assign(permissionButton.style, buttonStyle);
    document.body.appendChild(permissionButton);

    permissionButton.addEventListener("click", () => {
      DeviceOrientationEvent.requestPermission()
        .then((orientationState) => {
          if (orientationState === "granted") {
            localStorage.setItem(permissionKey, "true");
            callback(true);
          } else {
            callback(false);
          }
          permissionButton.remove();
        })
        .catch((error) => {
          console.error("Error requesting permissions:", error);
          callback(false);
          permissionButton.remove();
        });
    });
  } else {
    callback(true); // Permissions not required
  }
}

export function useTilt() {
  const [tilt, setTilt] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isPermissionGranted()) {
      initializeTilt();
    } else {
      requestPermissions((granted) => {
        if (granted) {
          initializeTilt();
        } else {
          console.warn("Permissions not granted.");
        }
      });
    }

    function initializeTilt() {
      if (!initialized) {
        const orientationHandler = (event) => {
          setTilt({ alpha: event.alpha, beta: event.beta, gamma: event.gamma });
        };
        window.addEventListener("deviceorientation", orientationHandler);
        setInitialized(true);

        return () => {
          window.removeEventListener("deviceorientation", orientationHandler);
        };
      }
    }
  }, [initialized]);

  return tilt;
}
