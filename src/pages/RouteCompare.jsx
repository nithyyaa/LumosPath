import { useEffect, useState } from "react";

export default function RouteCompare({ navigate }) {
  const [routes, setRoutes] = useState([]);

  // Fetch route suggestions from your backend
  useEffect(() => {
    fetch("http://localhost:4000/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data.routes || []));
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] p-4 text-white">
      {/* Header */}
      <button
        onClick={() => navigate("map")}
        className="text-xl text-white/70 mb-3"
      >
        ←
      </button>

      <h1 className="text-center text-2xl font-semibold mb-4">
        Compare Routes
      </h1>

      {/* Route Cards */}
      <div className="space-y-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-[#171717] p-4 rounded-xl shadow-[0_0_15px_#0fe9d230]"
          >
            <h2 className="text-xl font-semibold mb-1">{route.title}</h2>
            <p className="text-gray-300 text-sm">
              Estimated Time: {route.time}
            </p>
            <p className="text-gray-300 text-sm">
              Distance: {route.distance}
            </p>
            <p className="text-[#0fe9d2] font-bold mt-1">
              Safety Rating: {route.safety}
            </p>
          </div>
        ))}
      </div>

      {/* Select Route Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate("report")}
          className="w-full py-3 bg-[#0e2725] rounded-xl text-[#0fe9d2] shadow-[0_0_18px_#0fe9d240]"
        >
          Select Route
        </button>
      </div>
    </div>
  );
}
