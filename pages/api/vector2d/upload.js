const formidable = require("formidable");
const fs = require("fs");
import connectDB from "../../../lib/db.js";
import VectorAsset from "../../../models/VectorAsset.js";

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
      uploadDir: "./public/uploads/2d",
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ error: "Form parsing failed" });
      }
      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ error: "Missing file" });
      }

      const splitTags =
        fields.tags?.[0]?.split(",").map((tag) => tag.trim()) || [];
      const newFilename = file.newFilename;

      const asset = await VectorAsset.create({
        name: fields.title?.[0] || "Untitled",
        filePath: `/uploads/2d/${newFilename}`,
        originalFormat: fields.originalFormat?.[0] || fields.originalFormat || "unknown",
        tags: splitTags,
        ownerUsername: fields.ownerUsername?.[0] || fields.ownerUsername || "demo",
      });
      return res.status(200).json({ status: "uploaded", asset });
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
