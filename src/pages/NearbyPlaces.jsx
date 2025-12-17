import { useState, useEffect } from "react";
import axios from "axios";

export default function NearbyPlaces({ navigate }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await axios.get(
            `http://localhost:4000/api/safe-places?lat=${lat}&lon=${lon}`
          );
          setPlaces(res.data);
        } catch (err) {
          console.log("Error fetching places");
        }

        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  return (
    <div className="w-full h-screen bg-[#0b0b0b] text-white p-6">
      
      {/* Back */}
      <button
        onClick={() => navigate("sos")}
        className="text-xl text-white/70 mb-4"
      >
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4 text-[#0fe9d2]">
        Nearby Safe Places
      </h2>

      {loading ? (
        <p className="text-center mt-10 text-white/70">Loading...</p>
      ) : places.length === 0 ? (
        <p className="text-center mt-10 text-red-400">No safe places found</p>
      ) : (
        <div className="space-y-3">
          {places.map((p, i) => (
            <div
              key={i}
              className="bg-[#111] rounded-lg p-4 border border-[#333] cursor-pointer hover:bg-[#1c1c1c]"
              onClick={() =>
                window.open(`https://www.google.com/maps?q=${p.lat},${p.lon}`, "_blank")
              }
            >
              <div className="font-semibold text-[#0fe9d2]">{p.name}</div>
              <div className="text-sm text-white/60">{p.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
