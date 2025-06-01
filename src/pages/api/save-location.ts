import type { APIRoute } from 'astro';
import { turso } from '../../turso';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse JSON data with error handling
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { device_model, latitude, longitude, accuracy, location } = data;

    // Validate required fields
    if (!device_model || latitude === undefined || longitude === undefined || accuracy === undefined || !location) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate data types
    if (typeof device_model !== 'string' || typeof location !== 'string') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid data types'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    const acc = Number(accuracy);

    if (isNaN(lat) || isNaN(lon) || isNaN(acc)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid numeric values'
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
        device_model.trim(),
        lat,
        lon,
        acc,
        location.trim(),
        new Date().toISOString()
      ]
    });

    return new Response(JSON.stringify({ 
      success: true, 
      id: Number(result.lastInsertRowid),
      message: 'Data saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving location data:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to save location data',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};