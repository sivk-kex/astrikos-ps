const formidable = require("formidable");
const fs = require("fs");
const MapScene = require("../../../models/MapScene");

import connectDB from "../../../lib/db";
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  try {
    await connectDB();

    const form = new formidable.IncomingForm({
      uploadDir: "./public/uploads/maps",
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Upload failed" });

      const file = files.file?.[0] || files.file;
      if (!file) return res.status(400).json({ error: "Missing file" });

      const asset = await MapScene.create({
        name: file.originalFilename || file.newFilename,
        filePath: `/uploads/maps/${file.newFilename}`,
        tags: (fields.tags?.[0] || "").split(","),
        ownerId: fields.ownerID?.[0] || "demo",
      });

      return res.status(200).json({ status: "uploaded", asset });
    });
  } catch (err) {
    console.error("Map Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
