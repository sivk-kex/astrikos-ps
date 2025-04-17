import mongoose from "mongoose";

const ModelAssetSchema = new mongoose.Schema({
  name: String,
  filePath: String,
  originalFormat: String,
  tags: [String],
  ownerUsername: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ModelAsset =
  mongoose.models.ModelAsset || mongoose.model("ModelAsset", ModelAssetSchema);
export default ModelAsset;
