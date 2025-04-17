import connectDB from "../../../lib/db.js";
import VectorAsset from "../../../models/VectorAsset.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const { name } = req.query; // For GET, use `req.query` not `req.body`
  
    try {
      const vectors = await VectorAsset.find({ ownerUsername: name });

      if (!vectors || vectors.length === 0) {
        return res.status(404).json({ error: "No vectors found for this user" });
      }

      return res.status(200).json(vectors);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Server error", details: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
