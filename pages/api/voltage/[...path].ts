import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  
  const voltageUrl = `https://voltageapi.com/v1/${pathString}`;
  
  // Debug logging
  console.log('Voltage API Proxy Request:', {
    method: req.method,
    url: voltageUrl,
    hasApiKey: !!process.env.VOLTAGE_API_KEY || !!process.env.NEXT_PUBLIC_VOLTAGE_API_KEY,
    bodySize: req.body ? JSON.stringify(req.body).length : 0
  });
  
  try {
    // Get API key from server-side environment variable
    const apiKey = process.env.VOLTAGE_API_KEY || process.env.NEXT_PUBLIC_VOLTAGE_API_KEY || '';
    
    if (!apiKey) {
      console.error('No Voltage API key found in environment variables');
      res.status(500).json({ error: 'Voltage API key not configured' });
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const response = await fetch(voltageUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    res.status(response.status);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Voltage API proxy error:', error);
    res.status(500).json({ error: 'Voltage API proxy failed' });
  }
} 