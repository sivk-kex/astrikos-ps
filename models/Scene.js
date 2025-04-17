import mongoose from "mongoose";


const SceneSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerUsername: String,
  createdAt: { type: Date, default: Date.now },
  assets: [
    {
      assetId: String,
      type: String,
      position: { x: Number, y: Number, z: Number },
      rotation: { x: Number, y: Number, z: Number },
      scale: { x: Number, y: Number, z: Number },
    },
  ],
  publicToken: { type: String, unique: true, sparse: true },
});

module.exports = mongoose.models.Scene || mongoose.model("Scene", SceneSchema);
