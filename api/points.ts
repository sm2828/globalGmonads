import { createClient } from '@vercel/edge-config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const config = createClient(process.env.EDGE_CONFIG);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const points = await config.get('points');
      res.status(200).json(points || []);
    } catch (error) {
      console.error('Error fetching points:', error);
      res.status(500).json({ error: 'Failed to fetch points' });
    }
  } else if (req.method === 'POST') {
    try {
      const points = req.body;
      await config.upsert([{ key: 'points', value: points }]);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving points:', error);
      res.status(500).json({ error: 'Failed to save points' });
    }
  }
}