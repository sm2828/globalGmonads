import { createClient } from '@vercel/edge-config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const config = createClient(process.env.EDGE_CONFIG);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching points from Edge Config');
      const points = await config.get('points');
      console.log('Points retrieved:', points);
      res.status(200).json(points || []);
    } catch (error) {
      console.error('Error fetching points:', error);
      res.status(500).json({ error: 'Failed to fetch points' });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Received points to save:', req.body);
      const points = req.body;
      await config.set('points', points);
      console.log('Points saved successfully');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Detailed error saving points:', error);
      res.status(500).json({ error: 'Failed to save points' });
    }
  }
}