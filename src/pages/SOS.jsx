import { useState } from "react";

export default function SOS({ navigate }) {
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function sendSOS() {
    setSending(true);
    setStatusMsg("Getting location...");

    let locationURL = "Not Available";

    try {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locationURL = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    } catch {}

    setStatusMsg("Sending SOS...");

    const messageText = "⚠ Emergency! I need immediate help. Please contact me.";

    try {
      const res = await fetch("http://localhost:4000/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          location: locationURL,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg("🚨 SOS Sent Successfully!");
        alert("🚨 SOS Sent Successfully!");
      } else {
        setStatusMsg("❌ Failed to send SOS!");
        alert("❌ Failed to send SOS!");
      }
    } catch (error) {
      setStatusMsg("❌ Network Error");
      alert("❌ Network Error – Check backend/server!");
    }

    setSending(false);
  }

  return (
    <div className="w-full h-screen bg-[#0b0b0b] text-white p-6 flex flex-col items-center justify-center">

      {/* Back Button */}
      <button
        onClick={() => navigate("map")}
        className="absolute top-4 left-4 text-xl text-white/70"
      >
        ←
      </button>

      <h1 className="text-2xl font-semibold mb-8 text-red-400">Emergency SOS</h1>
      
      {/* SOS Button */}
      <button
        disabled={sending}
        onClick={sendSOS}
        className={`w-40 h-40 rounded-full flex items-center justify-center
          text-3xl font-bold shadow-[0_0_25px_#ff3333]
          border-[5px] border-[#ff9999]
          ${sending ? "bg-gray-600" : "bg-red-700 animate-pulse"}`}
      >
        🚨
      </button>

      <p className="text-center mt-6 text-lg text-[#ff8080]">
        {sending ? "Please wait..." : "Tap to send emergency alert"}
      </p>

      {statusMsg && (
        <p className="mt-4 text-sm text-[#9efcfc] text-center">{statusMsg}</p>
      )}

      {/* NEW BUTTON — navigate without changing UI layout */}
      <button
        onClick={() => navigate("places")}
        className="mt-8 w-56 py-3 rounded-xl bg-[#0e2725] text-[#0fe9d2] text-md border border-[#0fe9d2]"
      >
        Show Nearby Safe Places
      </button>
    </div>
  );
}
