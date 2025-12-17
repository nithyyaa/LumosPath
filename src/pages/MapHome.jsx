import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import { useState, useEffect } from "react";
import axios from "axios";
import L from "leaflet";
import polyline from "@mapbox/polyline";

// USER ICON
const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// DESTINATION ICON
const destIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535137.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function MapHome({ navigate, setSafetyData }) {
  const [position, setPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [destination, setDestination] = useState(null);

  const [fastestRoute, setFastestRoute] = useState(null);
  const [safestRoute, setSafestRoute] = useState(null);

  const [fastestScore, setFastestScore] = useState(null);
  const [safestScore, setSafestScore] = useState(null);
  const [dangerZones, setDangerZones] = useState([]);

  // 🔥 LOCATION SYSTEM: Attempt GPS → If Wrong/Denied → Use IP Auto Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("📍 GPS Location:", pos.coords);
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      async () => {
        console.log("⚠ GPS failed, using IP-based location…");
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          console.log("🌍 IP Based Location:", data);
          setPosition([data.latitude, data.longitude]);
        } catch (err) {
          console.log("❌ Both location methods failed. Using fallback.");
          setPosition([17.385, 78.486]); // final fallback Hyderabad
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  }, []);

  // 🔍 SEARCH DESTINATION
  async function searchPlaces(query) {
    if (!query) return setResults([]);

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: 1,
          limit: 8,
        });

      const res = await axios.get(url, {
        headers: { "User-Agent": "LumosPathApp" },
      });

      setResults(res.data);
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  // 🔥 SAFETY SCORE API
  async function fetchSafetyScores(fastCoords, safeCoords) {
    try {
      const res = await axios.post("http://localhost:4000/api/safety-score", {
        fastest: fastCoords,
        safest: safeCoords,
      });

      const fs = res.data.fastestScore;
      const ss = res.data.safestScore;
      const dz = res.data.dangerZones || [];

      setFastestScore(fs);
      setSafestScore(ss);
      setDangerZones(dz);

      setSafetyData({ fastestScore: fs, safestScore: ss, dangerZones: dz });
    } catch (e) {
      console.error("Safety score error:", e);
      alert("⚠ Could not fetch safety score");
    }
  }

  // 🎯 ROUTE GENERATION
  async function generateRoutes(destLat, destLon) {
    if (!position) return;

    try {
      const start = `${position[1]},${position[0]}`;
      const end = `${destLon},${destLat}`;

      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&alternatives=true&geometries=polyline`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes) return;

      // fastest route
      const fastRaw = polyline.decode(data.routes[0].geometry);
      const fastCoords = fastRaw.map(([lat, lon]) => [lat, lon]);
      setFastestRoute(fastCoords);

      // alternative safe route if exists
      let safeCoords = fastCoords;
      if (data.routes[1]) {
        const safeRaw = polyline.decode(data.routes[1].geometry);
        safeCoords = safeRaw.map(([lat, lon]) => [lat, lon]);
        setSafestRoute(safeCoords);
      } else {
        setSafestRoute(fastCoords);
      }

      fetchSafetyScores(fastCoords, safeCoords);
    } catch (e) {
      console.error("Route generation failed:", e);
      alert("⚠ Unable to generate route");
    }
  }

  // When clicking search result
  function handleSelect(item) {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setDestination([lat, lon]);
    setSearchText(item.display_name);
    setResults([]);
    generateRoutes(lat, lon);
  }

  return (
    <div className="w-full h-screen relative bg-[#0b0b0b]">

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 flex items-center bg-[#1a1a1a] text-white">
        <span className="text-lg">📍 LumosPath</span>
        <div className="ml-auto text-xl">⚙️</div>
      </div>

      {/* SEARCH BAR */}
      <div className="absolute top-16 left-0 right-0 z-[500] px-4">
        <input
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            searchPlaces(e.target.value);
          }}
          placeholder="Search destination..."
          className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#333]"
        />

        {results.length > 0 && (
          <div className="bg-[#111] mt-2 rounded-xl border border-[#333] text-white max-h-60 overflow-y-auto">
            {results.map((item) => (
              <div
                key={item.place_id}
                className="px-4 py-3 hover:bg-[#222] cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP DISPLAY */}
      {position && (
        <MapContainer
          center={destination || position}
          zoom={16}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />

          <Marker position={position} icon={userIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>

          {destination && (
            <Marker position={destination} icon={destIcon}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {fastestRoute && (
            <Polyline positions={fastestRoute} color="#0096FF" weight={6} />
          )}

          {safestRoute && (
            <Polyline
              positions={safestRoute}
              color="#00FF7F"
              weight={6}
              dashArray="10,10"
            />
          )}

          {dangerZones.map((z, i) => (
            <Circle
              key={i}
              center={[z.lat, z.lon]}
              radius={120 + z.risk * 200}
              pathOptions={{
                color: "rgba(255,0,0,0.7)",
                fillColor: "rgba(255,0,0,0.4)",
                fillOpacity: 0.5,
                weight: 1,
              }}
            />
          ))}
        </MapContainer>
      )}

      {/* SAFETY SCORE PANEL */}
      {(fastestScore || safestScore) && (
        <div className="absolute bottom-24 left-0 right-0 mx-auto w-[90%] z-[900]">
          <div className="bg-[#111] rounded-xl p-4 border border-[#333] text-white">
            <h3 className="text-lg font-semibold mb-3">Route Safety</h3>
            {fastestScore && (
              <div className="flex justify-between py-2 border-b border-[#333]">
                <span>Fastest Route</span>
                <span className="text-green-400">⭐ {fastestScore}</span>
              </div>
            )}
            {safestScore && (
              <div className="flex justify-between py-2">
                <span>Safest Route</span>
                <span className="text-green-400">⭐ {safestScore}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚨 SOS BUTTON */}
      <button
        onClick={() => navigate("sos")}
        className="absolute top-20 right-4 z-[1000] w-16 h-16 rounded-full bg-[#8b0000] text-white text-3xl flex items-center justify-center shadow-[0_0_25px_#ff1a1a] border-[4px] border-[#ffb3b3] animate-pulse"
      >
        🚨
      </button>

      {/* NAV BAR */}
      <div className="absolute bottom-0 left-0 right-0 z-[500] p-4 bg-[#0b0b0b] flex gap-3 shadow-[0_-5px_20px_#000]">
        <button onClick={() => navigate("compare")} className="flex-1 py-3 rounded-xl bg-[#0e2725] text-[#0fe9d2]">Routes</button>
        <button onClick={() => navigate("map")} className="flex-1 py-3 rounded-xl bg-[#0e2725] text-[#0fe9d2]">Find Safe Route</button>
        <button onClick={() => navigate("report")} className="flex-1 py-3 rounded-xl bg-[#0e2725] text-[#0fe9d2]">Safety Metrics</button>
      </div>
    </div>
  );
}
