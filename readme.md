# useTilt Hook

The `useTilt` hook is a custom React hook that allows you to capture and use the device's orientation (tilt) data in your React applications. It requests the necessary permissions and provides the tilt data for use in your components.

## Installation

To use the `useTilt` hook, you need to include the hook code in your project. You can create a file named `useTilt.js` in your `src` directory and paste the hook code into it.

### useTilt.js

```javascript
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
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
          setTilt({ x: event.beta, y: event.gamma });
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
```

````

## Usage

Once you have the `useTilt` hook in your project, you can use it in any React component to get the device's tilt data.

### Example

Here's a simple example of how to use the `useTilt` hook to move a div based on the device's tilt:

1. **Create a TiltedDiv Component**

   **TiltedDiv.js**:

   ```javascript
   import React from "react";
   import { useTilt } from "./useTilt";

   const TiltedDiv = () => {
     const tilt = useTilt();

     const style = {
       width: "100px",
       height: "100px",
       backgroundColor: "lightblue",
       position: "absolute",
       top: `calc(50% + ${tilt.x}px)`,
       left: `calc(50% + ${tilt.y}px)`,
       transform: "translate(-50%, -50%)",
     };

     return <div style={style} />;
   };

   export default TiltedDiv;
   ```

2. **Wrap the TiltedDiv Component in the App Component**

   **App.js**:

   ```javascript
   import React from "react";
   import TiltedDiv from "./TiltedDiv";

   const App = () => {
     return (
       <div style={{ height: "100vh", position: "relative" }}>
         <TiltedDiv />
       </div>
     );
   };

   export default App;
   ```

3. **Modify the Main Entry File**

   Ensure your main entry point renders the `App` component.

   **main.jsx**:

   ```javascript
   import React from "react";
   import ReactDOM from "react-dom/client";
   import "./index.css";
   import App from "./App";

   ReactDOM.createRoot(document.getElementById("root")).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

````
