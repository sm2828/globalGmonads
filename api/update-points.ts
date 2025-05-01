import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const points = req.body;
      
      // Use Edge Config REST API directly
      const response = await fetch(`${process.env.EDGE_CONFIG_BASE_URL}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ 
            operation: 'upsert',
            key: 'points',
            value: points 
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating points:', error);
      res.status(500).json({ error: 'Failed to update points' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
