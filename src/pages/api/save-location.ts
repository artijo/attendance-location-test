import type { APIRoute } from 'astro';
import { turso } from '../../turso';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { device_model, latitude, longitude, accuracy, location } = data;

    // Validate required fields
    if (!device_model || latitude === undefined || longitude === undefined || accuracy === undefined || !location) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert data into database
    const result = await turso.execute({
      sql: `INSERT INTO device_locations (device_model, latitude, longitude, accuracy, location, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        device_model,
        latitude,
        longitude,
        accuracy,
        location,
        new Date().toISOString()
      ]
    });

    return new Response(JSON.stringify({ 
      success: true, 
      id: Number(result.lastInsertRowid)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving location data:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save location data' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};