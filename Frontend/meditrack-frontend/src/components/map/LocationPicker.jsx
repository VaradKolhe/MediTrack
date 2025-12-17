import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

// This helper component handles the click events
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => {
        setPosition(e.target.getLatLng());
      },
    }}>
    </Marker>
  );
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }) {
  // Default to a central location (e.g., Nagpur, India) or the initial passed props
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Notify parent component whenever position changes
  useEffect(() => {
    if (position && onLocationSelect) {
      onLocationSelect(position.lat, position.lng);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm relative z-0">
      <MapContainer
        center={[21.1458, 79.0882]} // Default center (Nagpur)
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Esri Satellite Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* Street Labels Overlay (Optional, makes satellite easier to read) */}
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />

        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {/* Overlay to show current selection */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm font-mono text-slate-800">
        {position ? (
          <>
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