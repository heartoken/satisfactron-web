import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "gel";

const client = createClient();

export async function GET() {
  try {
    const result = await client.query(`
      select MealPeriod {
        id,
        name,
        start_time,
        end_time,
        is_active,
        created_at
      } filter .is_active = true
      order by .start_time;
    `);

    return NextResponse.json(result || []);
  } catch (error) {
    console.error("Error fetching meal periods:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startTime, endTime } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: "name, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    // Ensure time format is correct (HH:MM or HH:MM:SS)
    const formatTime = (time: string) => {
      if (time.length === 5) {
        // HH:MM format
        return time + ":00"; // Convert to HH:MM:SS
      }
      return time;
    };

    const result = await client.querySingle(
      `
      insert MealPeriod {
        name := <str>$name,
        start_time := <cal::local_time><str>$startTime,
        end_time := <cal::local_time><str>$endTime
      };
    `,
      {
        name,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating meal period:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
