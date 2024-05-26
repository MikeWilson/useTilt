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

## Usage

Once you have the `useTilt` hook in your project, you can use it in any React component to get the device's tilt data.

### Example

Here's an example of how to use the `useTilt` hook to move a grid of dots based on the device's tilt:

1. **Create a Dot Component**

   This component renders a dot (sphere) and moves it based on the device's tilt.

   **Dot.js**:

   ```javascript
   import React, { useRef, useEffect } from "react";
   import { useFrame } from "@react-three/fiber";

   const Dot = ({ position, tilt }) => {
     const mesh = useRef();

     useEffect(() => {
       // Set initial position
       mesh.current.position.set(...position);
     }, [position]);

     useFrame(() => {
       // Adjust dot position based on device tilt
       mesh.current.position.x = position[0] + tilt.y * 0.005;
       mesh.current.position.y = position[1] - tilt.x * 0.005;
       mesh.current.position.z = position[2]; // Keep z constant

       // Mirror the position if the dot goes too far off screen
       const boundary = 5; // Define boundary for mirroring
       if (mesh.current.position.x > boundary) {
         mesh.current.position.x = -boundary;
       } else if (mesh.current.position.x < -boundary) {
         mesh.current.position.x = boundary;
       }
       if (mesh.current.position.y > boundary) {
         mesh.current.position.y = -boundary;
       } else if (mesh.current.position.y < -boundary) {
         mesh.current.position.y = boundary;
       }
     });

     return (
       <mesh ref={mesh} position={position}>
         <sphereGeometry args={[0.1, 16, 16]} />
         <meshStandardMaterial color="black" />
       </mesh>
     );
   };

   export default Dot;
   ```

2. **Create the Scene Component**

   This component renders a grid of dots and uses the `useTilt` hook to move them.

   **Scene.js**:

   ```javascript
   import React, { useRef, useEffect } from "react";
   import { Canvas } from "@react-three/fiber";
   import { OrbitControls } from "@react-three/drei";
   import Dot from "./Dot";
   import { useTilt } from "./useTilt";

   const Scene = () => {
     const tilt = useTilt();
     const dotsRef = useRef([]);

     // Create grid of dots
     useEffect(() => {
       const gridSize = 10;
       const spacing = 1;
       const dots = [];

       for (let x = -gridSize / 2; x < gridSize / 2; x++) {
         for (let y = -gridSize / 2; y < gridSize / 2; y++) {
           dots.push({
             id: `${x}-${y}`,
             position: [x * spacing, y * spacing, 0], // Keep z constant at 0
           });
         }
       }

       dotsRef.current = dots;
     }, []);

     return (
       <Canvas>
         <ambientLight intensity={0.5} />
         <pointLight position={[10, 10, 10]} />
         <OrbitControls />
         {dotsRef.current.map((dot) => (
           <Dot key={dot.id} position={dot.position} tilt={tilt} />
         ))}
       </Canvas>
     );
   };

   export default Scene;
   ```

3. **Wrap the Scene Component in the App Component**

   **App.js**:

   ```javascript
   import React from "react";
   import Scene from "./Scene";

   const App = () => {
     return (
       <div style={{ height: "100vh" }}>
         <Scene />
       </div>
     );
   };

   export default App;
   ```

4. **Modify the Main Entry File**

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
