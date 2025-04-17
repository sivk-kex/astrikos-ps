const formidable = require("formidable");
import MapScene from "../../../models/MapScene";
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
      multiples: false, 
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = files.file;
      if (!file) return res.status(400).json({ error: "File not found" });
      const title = fields.title?.[0] || fields.title || "Untitled";
      const date = fields.date?.[0] || fields.date || new Date().toISOString();
      const tags = fields.tags?.[0] || fields.tags || "default";
      const ownerUsername =
        fields.ownerUsername?.[0] || fields.ownerUsername || "demo"; // Optional
      const splitTags = tags.split(",").map((tag) => tag.trim());

      const newFilename = file[0].newFilename;

      const asset = await MapScene.create({
        name: title,
        filePath: `/uploads/maps/${newFilename}`,
        tags: splitTags,
        date: new Date(date),
        ownerUsername: ownerUsername,
      });

      return res.status(200).json({
        status: "uploaded",
        asset,
        url: `/uploads/maps/${newFilename}`,
      });
    });
  } catch (err) {
    console.error("Map Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
