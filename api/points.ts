import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG);

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  if (req.method === 'GET') {
    try {
      const points = await edgeConfig.get('points');
      return new Response(JSON.stringify(points || []), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching points:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch points' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else if (req.method === 'POST') {
    try {
      const points = await req.json();
      await edgeConfig.set('points', points);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error saving points:', error);
      return new Response(JSON.stringify({ error: 'Failed to save points' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}