import connectDB from '../../../lib/db';
import MapScene from '../../../models/MapScene';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    const map = await MapScene.findById(id);
    if (!map) return res.status(404).json({ error: 'Map not found' });
    return res.status(200).json(map);
  }

  if (req.method === 'PUT') {
    try {
      const { geojsonData } = req.body;
      if (!geojsonData) return res.status(400).json({ error: 'GeoJSON data is required' });
      const updated = await MapScene.findByIdAndUpdate(id, { geojsonData }, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: 'Map not found' });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await MapScene.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
