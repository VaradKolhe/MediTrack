import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ChevronLeft, Navigation, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Import Routing CSS
import L from "leaflet";
import "leaflet-routing-machine"; // Import the library

// --- FIX LEAFLET ICONS ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- ROUTING COMPONENT ---
// This component sits inside the Map and handles drawing the line
const RoutingMachine = ({ userLocation, hospitalLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !hospitalLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(hospitalLocation[0], hospitalLocation[1]),
      ],
      routeWhileDragging: false,
      show: false, // Hides the text instructions box on the map
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#2563EB", opacity: 0.8, weight: 5 }], // Blue line style
      },
      createMarker: function () {
        return null;
      }, // Don't create extra markers, we have our own
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, userLocation, hospitalLocation]);

  return null;
};

const HospitalMap = ({
  hospitals = [],
  center = [18.5204, 73.8567],
  zoom = 13,
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsError, setGpsError] = useState(false);

  // If a single object is passed, wrap it in array
  const hospitalList = Array.isArray(hospitals) ? hospitals : [hospitals];
  const targetHospital = hospitalList[0];

  // --- GET USER LOCATION ON MOUNT ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGpsError(true);
        }
      );
    } else {
      setGpsError(true);
    }
  }, []);

  // --- GOOGLE MAPS REDIRECT ---
  const handleStartNavigation = () => {
    if (!targetHospital?.latitude || !targetHospital?.longitude) {
      alert("Location coordinates not available.");
      return;
    }

    // Better Google Maps URL (Universal Link)
    const lat = targetHospital.latitude;
    const lng = targetHospital.longitude;
    // api=1 ensures it opens in the app on mobile or new tab on web
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    window.open(url, "_blank");
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner group z-0">
      {/* --- SIDEBAR MENU --- */}
      <div
        className={`absolute top-4 left-4 z-[400] bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden
          ${isSidebarOpen ? "w-64 h-auto max-h-[80%]" : "w-12 h-12"}
        `}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!isSidebarOpen);
          }}
          className={`absolute top-0 right-0 p-3 text-slate-500 hover:text-blue-600 transition-colors ${
            !isSidebarOpen && "w-full h-full flex items-center justify-center"
          }`}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <Navigation size={20} />}
        </button>

        <div
          className={`p-4 pt-12 ${
            !isSidebarOpen && "opacity-0 pointer-events-none"
          }`}
        >
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Navigation size={16} className="text-blue-600" /> Navigation
          </h3>
          <div className="space-y-3">
            {/* Origin Box */}
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 flex gap-2 items-start">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-slate-800 mb-0.5">
                  Your Location
                </p>
                {userLocation ? (
                  <p className="text-xs text-green-600 font-medium">
                    GPS Connected
                  </p>
                ) : gpsError ? (
                  <p className="text-xs text-red-500">GPS Disabled/Error</p>
                ) : (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Locating...
                  </p>
                )}
              </div>
            </div>

            <div className="pl-4 -my-2">
              <div className="w-0.5 h-4 border-l-2 border-dashed border-slate-300" />
            </div>

            {/* Destination Box */}
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 flex gap-2 items-start">
              <MapPin size={14} className="mt-0.5 text-rose-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 mb-0.5">
                  Destination
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {targetHospital ? targetHospital.name : "Select a Hospital"}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartNavigation}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-xs transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Navigation size={14} />
              Open Google Maps
            </button>
          </div>
        </div>
      </div>

      {/* --- LEAFLET MAP --- */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Show Route if we have user location AND a target hospital */}
        {userLocation && targetHospital && targetHospital.latitude && (
          <RoutingMachine
            userLocation={userLocation}
            hospitalLocation={[
              targetHospital.latitude,
              targetHospital.longitude,
            ]}
          />
        )}

        {/* 2. Show User Marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* 3. Show Hospital Markers */}
        {hospitalList.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude || 18.5204, h.longitude || 73.8567]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-slate-800">{h.name}</h3>
                <p className="text-xs text-slate-500 my-1">
                  {h.city}, {h.state}
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                    {Math.max((h.totalBeds || 0) - (h.occupiedBeds || 0), 0)}{" "}
                    Beds Free
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
