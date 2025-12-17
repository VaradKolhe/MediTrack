import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// Helper component to handle the routing logic
function RoutingMachine({ userLocation, hospitalLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !hospitalLocation) return;

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(hospitalLocation.lat, hospitalLocation.lng),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }], // Blue line
      },
      // Customize the markers for Start (User) and End (Hospital)
      createMarker: function (i, waypoint, n) {
        const markerIcon = L.icon({
          iconUrl:
            i === 0
              ? "https://cdn-icons-png.flaticon.com/512/3603/3603850.png" // User Icon
              : "https://cdn-icons-png.flaticon.com/512/2838/2838912.png", // Hospital Icon
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        return L.marker(waypoint.latLng, { icon: markerIcon });
      },
    }).addTo(map);

    // Cleanup on unmount
    return () => map.removeControl(routingControl);
  }, [map, userLocation, hospitalLocation]);

  return null;
}

export default function HospitalNavigator({
  hospitalLat,
  hospitalLng,
  hospitalName,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // 1. Get User's Live Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError("Unable to retrieve your location.");
        console.error(err);
      }
    );
  }, []);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!userLocation)
    return <div className="text-slate-500 p-4">Locating you...</div>;

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-md">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* This component handles the actual drawing of the route */}
        <RoutingMachine
          userLocation={userLocation}
          hospitalLocation={{ lat: hospitalLat, lng: hospitalLng }}
        />
      </MapContainer>
    </div>
  );
}
