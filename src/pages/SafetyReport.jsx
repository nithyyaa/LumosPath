import React from "react";

export default function SafetyReport({ navigate, safetyData }) {
  
  // 🚨 If user opens page without generating route data first
  if (!safetyData) {
    return (
      <div className="w-full min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center p-4">
        <p className="text-lg text-center mb-4">
          ⚠ No safety data available.
          <br />
          Please search a destination first.
        </p>
        <button
          onClick={() => navigate("map")}
          className="px-6 py-3 bg-[#0e2725] rounded-xl text-[#0fe9d2]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { fastestScore, safestScore, dangerZones } = safetyData;

  return (
    <div className="w-full min-h-screen bg-[#0b0b0b] text-white p-4">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("map")}
        className="text-xl text-white/70 mb-3"
      >
        ←
      </button>

      <h1 className="text-center text-2xl font-semibold mb-4">
        Safety Report
      </h1>

      {/* Safety Score Summary */}
      <div className="bg-[#08302c] rounded-xl p-4 shadow-[0_0_18px_#0fe9d230] mb-4">
        <h2 className="font-semibold mb-2 text-lg">Route Safety Scores</h2>

        <div className="flex justify-between py-2 border-b border-[#0b4942] text-sm">
          <span>Fastest Route Score</span>
          <span className="text-green-400 font-bold">⭐ {fastestScore}</span>
        </div>

        <div className="flex justify-between pt-2 text-sm">
          <span>Safest Route Score</span>
          <span className="text-green-400 font-bold">⭐ {safestScore}</span>
        </div>
      </div>

      {/* Danger Zones */}
      <div className="bg-[#08302c] rounded-xl p-4 shadow-[0_0_18px_#0fe9d230] mb-5">
        <h2 className="font-semibold mb-3 text-lg">Detected Danger Zones</h2>

        {dangerZones.length === 0 ? (
          <p className="text-gray-300 text-sm">No danger spots detected 🎉</p>
        ) : (
          dangerZones.map((z, i) => (
            <div key={i} className="mb-3">
              <p className="text-gray-300 text-xs">
                Lat: {z.lat.toFixed(4)} | Lon: {z.lon.toFixed(4)}
              </p>

              <div className="w-full h-3 bg-[#0b4942] rounded overflow-hidden mt-1">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${z.risk * 100}%` }}
                ></div>
              </div>

              <p className="text-xs text-[#ff7777] mt-1">
                Risk Level: {(z.risk * 100).toFixed(1)}%
              </p>
            </div>
          ))
        )}
      </div>

      {/* Action Button */}
      <button className="w-full py-3 bg-[#0e2725] rounded-xl text-[#0fe9d2] shadow-[0_0_18px_#0fe9d240]">
        View Detailed AI Insights (coming soon)
      </button>
    </div>
  );
}
