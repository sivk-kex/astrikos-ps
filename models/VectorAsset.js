import mongoose from "mongoose";

const VectorAssetSchema = new mongoose.Schema({
  name: String,
  filePath: String,
  originalFormat: String,
  tags: [String],
  ownerUsername: String,
  createdAt: { type: Date, default: Date.now },
});

const VectorAsset =
  mongoose.models.VectorAsset ||
  mongoose.model("VectorAsset", VectorAssetSchema);

export default VectorAsset;
