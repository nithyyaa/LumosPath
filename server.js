// ================================
// LumosPath Backend (SOS + Safety + Safe Places)
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import twilio from "twilio";

dotenv.config();

// Create express app FIRST (so app exists)
const app = express();
app.use(cors());
app.use(express.json());

// ------------------ TWILIO SETUP (Optional SOS) ------------------ //
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ------------------ SOS ENDPOINT ------------------ //
app.post("/api/sos", async (req, res) => {
  const { message, location } = req.body;

  const finalMessage =
    `🚨 SOS ALERT 🚨\n` +
    `${message || "Emergency! I need immediate help!"}\n` +
    (location ? `📍 Location: ${location}` : "");

  try {
    const sms = await client.messages.create({
      body: finalMessage,
      from: process.env.TWILIO_PHONE,
      to: process.env.MY_PHONE,
    });

    console.log("📩 SMS Sent | SID:", sms.sid);
    return res.json({ success: true, sid: sms.sid });
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------- SAFETY SCORE ENDPOINT ---------------- //
app.post("/api/safety-score", async (req, res) => {
  const { fastest, safest } = req.body;

  try {
    const sample = (coords, count = 6) => {
      if (!coords || coords.length === 0) return [];
      if (coords.length <= count) return coords;
      const step = Math.floor(coords.length / count);
      return coords.filter((_, i) => i % step === 0).slice(0, count);
    };

    const fastPoints = sample(fastest);
    const safePoints = sample(safest);

    const fetchPointData = async ([lat, lon]) => {
      try {
        const q = `
          [out:json][timeout:20];
          (
            node(around:300, ${lat}, ${lon})["highway"="street_lamp"];
            node(around:300, ${lat}, ${lon})["man_made"="surveillance"];
          );
          out count;
        `;

        const resp = await axios.get(
          "https://overpass-api.de/api/interpreter",
          { params: { data: q } }
        );

        const count = resp?.data?.elements?.[0]?.count || 0;
        const score = Math.min(5, 3 + count * 0.3);

        return { lat, lon, score };
      } catch {
        return {
          lat,
          lon,
          score: 3.0 + Math.random() * 1.5,
        };
      }
    };

    const fastData = await Promise.all(fastPoints.map(fetchPointData));
    const safeData = await Promise.all(safePoints.map(fetchPointData));

    const avg = (arr) =>
      Number((arr.reduce((a, b) => a + b.score, 0) / arr.length).toFixed(1));

    const fastestScore = avg(fastData);
    const safestScore = avg(safeData);

    const dangerZones = safeData
      .filter((p) => p.score < 3.2)
      .map((p) => ({
        lat: p.lat,
        lon: p.lon,
        risk: Number((5 - p.score).toFixed(2)),
      }));

    return res.json({
      fastestScore,
      safestScore,
      dangerZones,
    });
  } catch {
    return res.json({
      fastestScore: Number((3 + Math.random() * 1.2).toFixed(1)),
      safestScore: Number((3.5 + Math.random() * 1.2).toFixed(1)),
      dangerZones: [],
    });
  }
});

// ---------------- SAFE PLACES ENDPOINT (Improved) ---------------- //
app.get("/api/safe-places", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.json([]);

  const query = `
    [out:json][timeout:25];
    (
      node(around:2000, ${lat}, ${lon})["amenity"="hospital"];
      node(around:2000, ${lat}, ${lon})["amenity"="police"];
      node(around:2000, ${lat}, ${lon})["amenity"="pharmacy"];
      node(around:2000, ${lat}, ${lon})["amenity"="clinic"];
      node(around:2000, ${lat}, ${lon})["amenity"="bus_station"];
      node(around:2000, ${lat}, ${lon})["amenity"="fuel"];
      node(around:2000, ${lat}, ${lon})["amenity"="restaurant"];
      node(around:2000, ${lat}, ${lon})["amenity"="college"];
      node(around:2000, ${lat}, ${lon})["amenity"="school"];
      node(around:2000, ${lat}, ${lon})["amenity"="marketplace"];
      node(around:2000, ${lat}, ${lon})["amenity"="cafe"];
      node(around:2000, ${lat}, ${lon})["amenity"="public_building"];
    );
    out center;
  `;

  try {
    const resp = await axios.get(
      "https://overpass-api.de/api/interpreter",
      { params: { data: query } }
    );

    let places = resp.data.elements.map((p) => ({
      name: p.tags?.name || "Safe Place",
      type: p.tags?.amenity || "place",
      lat: p.lat,
      lon: p.lon,
    }));

    if (places.length === 0) {
      const nomi = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=hospital OR police OR pharmacy&lat=${lat}&lon=${lon}`
      );

      places = nomi.data.map((p) => ({
        name: p.display_name.split(",")[0],
        type: "general_safe_place",
        lat: p.lat,
        lon: p.lon,
      }));
    }

    if (places.length === 0) {
      places = [
        { name: "Nearest Main Road", type: "public_area", lat, lon },
      ];
    }

    res.json(places);
  } catch (err) {
    return res.json([
      { name: "Call Local Helpline", type: "emergency_advice", lat, lon },
    ]);
  }
});

// ---------------- START SERVER ---------------- //
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);

