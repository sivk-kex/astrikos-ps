const formidable = require("formidable");
const fs = require("fs");
const { connectDB } = require("../../../lib/db");
const VectorAsset = require("../../../models/VectorAsset");

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
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ error: "Form parsing failed" });
      }

      console.log("Parsed fields:", fields);
      console.log("Parsed files:", files);

      const file = files.file;
      if (!file) return res.status(400).json({ error: "Missing file" });

      const asset = await VectorAsset.create({
        name: file.originalFilename || file.newFilename,
        filePath: `/uploads/2d/${file.newFilename}`,
        originalFormat: file.mimetype,
        tags: (fields.tags?.[0] || "").split(","),
        ownerId: fields.ownerID?.[0] || "demo",
      });

      return res.status(200).json({ status: "uploaded", asset });
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// export default function handler(req, res) {
//     if (req.method === 'GET') {
//       return res.status(200).json({ message: 'GET route is working 🚀' });
//     }
//     if (req.method === 'POST') {
//       return res.status(200).json({ message: 'POST route is working 🚀' });
//     }
//     res.status(405).json({ error: 'Method Not Allowed' });
//   }
  