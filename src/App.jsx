import { useState } from "react";
import Splash from "./pages/Splash";
import MapHome from "./pages/MapHome";
import RouteCompare from "./pages/RouteCompare";
import SafetyReport from "./pages/SafetyReport";
import SOS from "./pages/SOS";
import NearbyPlaces from "./pages/NearbyPlaces"; // ⬅️ NEW IMPORT

export default function App() {
  const [page, setPage] = useState("splash");

  // 🔥 store safety data globally
  const [safetyData, setSafetyData] = useState(null);

  return (
    <div className="max-w-[430px] mx-auto h-screen overflow-hidden bg-[#0b0b0b] text-white">
      {page === "splash" && <Splash onContinue={() => setPage("map")} />}

      {page === "map" && (
        <MapHome navigate={setPage} setSafetyData={setSafetyData} />
      )}

      {page === "compare" && <RouteCompare navigate={setPage} />}

      {page === "report" && (
        <SafetyReport navigate={setPage} safetyData={safetyData} />
      )}

      {page === "sos" && <SOS navigate={setPage} />}

      {page === "places" && <NearbyPlaces navigate={setPage} />} {/* ⬅️ NEW PAGE */}
    </div>
  );
}
