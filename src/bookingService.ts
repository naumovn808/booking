import pool from './db';
import { type PoolClient, DatabaseError } from 'pg';

interface BookingData {
  event_id: number;
  user_id: string;
}

export async function reserveSeat({ event_id, user_id }: BookingData): Promise<number> {
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');

    const eventResult = await client.query(
      `SELECT total_seats FROM events WHERE id = $1 FOR UPDATE`,
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      throw new Error('Event not found');
    }
    const totalSeats = eventResult.rows[0].total_seats;

    const bookingCountResult = await client.query(
      `SELECT COUNT(*) FROM bookings WHERE event_id = $1`,
      [event_id]
    );
    const currentBookedCount = parseInt(bookingCountResult.rows[0].count, 10);

    if (currentBookedCount >= totalSeats) {
      await client.query('ROLLBACK');
      throw new Error('No available seats left');
    }

    const insertResult = await client.query(
      `INSERT INTO bookings (event_id, user_id) VALUES ($1, $2) RETURNING id`,
      [event_id, user_id]
    );

    const newBookingId = insertResult.rows[0].id;

    await client.query('COMMIT');

    return newBookingId;

  } catch (error) {

    await client.query('ROLLBACK');

    if (error instanceof DatabaseError && error.code === '23505') {
        throw new Error('User has already booked a seat for this event');
    }

    throw error;
    
  } finally {
    client.release();
  }
}