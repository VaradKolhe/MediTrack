import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix for broken marker icons in React-Leaflet
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider> 
      <App />
    </AuthProvider>
);