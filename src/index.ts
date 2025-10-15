import express, { type Request, type Response } from "express";
import { reserveSeat } from "./bookingService";
import dotenv from "dotenv";
import  pool  from "./db"; //

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/bookings/reserve", async (req: Request, res: Response) => {
  const { event_id, user_id } = req.body;

  if (!event_id || !user_id) {
    return res.status(400).json({ error: "Missing event_id or user_id" });
  }

  try {
    const bookingId = await reserveSeat({
      event_id: parseInt(event_id),
      user_id,
    });

    res.status(201).json({
      message: "Seat successfully reserved",
      booking_id: bookingId,
      event_id,
      user_id,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "User has already booked a seat for this event") {
      return res.status(409).json({ error: errorMessage });
    }
    if (errorMessage === "No available seats left") {
      return res.status(403).json({ error: errorMessage });
    }
    if (errorMessage === "Event not found") {
      return res.status(404).json({ error: errorMessage });
    }

    console.error("Booking error:", error);
    res.status(500).json({ error: "Internal server error during booking" });
  }
});

app.get("/api/get-user-count", async (req: Request, res: Response) => {
  const { period } = req.query;

  let interval = "1 month";
  if (period === "day") interval = "1 day";
  else if (period === "week") interval = "1 week";
  else if (period === "month") interval = "1 month";

  try {
    const result = await pool.query(
      `
      SELECT 
        user_id,
        COUNT(*) AS booking_count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY user_id
      ORDER BY booking_count DESC
      LIMIT 10;
      `
    );

    res.json(
      result.rows.map((row) => ({
        user_id: row?.user_id,
        booking_count: Number(row?.booking_count),
      }))
    );
  } catch (e) {
    console.error("error", e);
    res.status(500).json({ error: "Internal server error", e });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
