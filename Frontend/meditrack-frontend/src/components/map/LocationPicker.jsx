import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  LayersControl,
} from "react-leaflet";
import { Search, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// Fix for default Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to update map center when props change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        duration: 1.5, // Smooth animation duration
      });
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  );
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}) {
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Search State
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Notify parent whenever position updates internally
  useEffect(() => {
    if (position && onLocationSelect) {
      onLocationSelect(position.lat, position.lng);
    }
  }, [position, onLocationSelect]);

  // Handle City Search using OpenStreetMap Nominatim API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);

        // Update Marker Position
        setPosition({ lat: newLat, lng: newLng });
        toast.success(`Found: ${result.display_name.split(",")[0]}`);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full w-full relative z-0">
      {/* --- SEARCH BAR OVERLAY --- */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md shadow-xl"
      >
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, area, or landmark..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white/95 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />

          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-xs font-bold px-1">Go</span>
            )}
          </button>
        </div>
      </form>

      {/* --- MAP --- */}
      <MapContainer
        center={position ? [position.lat, position.lng] : [21.1458, 79.0882]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false} // Hide default zoom to put it somewhere else if needed, or keep standard
      >
        <LayersControl position="topright">
          {/* 1. Street View (Labeled & Clear) - Default */}
          <LayersControl.BaseLayer checked name="Street View">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>

          {/* 2. Satellite View */}
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapUpdater center={position ? [position.lat, position.lng] : null} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {/* Coordinate Overlay */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg z-[1000] text-sm font-mono text-slate-800 border border-slate-200">
        {position ? (
          <>
            <div className="font-bold text-xs text-slate-500 uppercase mb-1">
              Selected Pin
            </div>
            <div>Lat: {position.lat.toFixed(6)}</div>
            <div>Lng: {position.lng.toFixed(6)}</div>
          </>
        ) : (
          "Click map to set location"
        )}
      </div>
    </div>
  );
}
