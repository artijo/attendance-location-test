import type { APIRoute } from 'astro';
import { turso } from '../../turso';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate parameters
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid limit or offset parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await turso.execute({
      sql: `SELECT * FROM device_locations 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?`,
      args: [limit, offset]
    });

    const total = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM device_locations'
    });

    return new Response(JSON.stringify({
      success: true,
      data: result.rows,
      total: total.rows[0].count,
      limit,
      offset
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching location data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch location data',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};