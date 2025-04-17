import mongoose from "mongoose";

const MapSceneSchema = new mongoose.Schema({
  name: String,
  filePath: String,
  tags: [String],
  ownerUsername: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MapScene =
  mongoose.models.MapScene || mongoose.model("MapScene", MapSceneSchema);

export default MapScene;
