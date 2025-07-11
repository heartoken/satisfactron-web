import { type NextRequest, NextResponse } from "next/server"
import { createClient } from 'gel'

const client = createClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (deviceId) {
      // Get specific device stats
      const result = await client.query(`
        select Device {
          id,
          name,
          votes: {
            id,
            value,
            device: { id, name }
          }
        } filter .id = <uuid>$deviceId;
      `, { deviceId })

      const device = result[0]
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 })
      }

      return NextResponse.json(device)
    } else {
      // Get all devices
      const result = await client.query(`
        select Device {
          id,
          name,
          votes: {
            id,
            value,
            device: { id, name }
          }
        };
      `)

      return NextResponse.json(result || [])
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    // Return empty array for GET requests instead of error
    if (request.method === 'GET') {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, voteValue, deviceName, action } = body

    if (action === 'createDevice') {
      // Create device
      if (!deviceName || typeof deviceName !== "string") {
        return NextResponse.json({ error: "deviceName is required and must be a string" }, { status: 400 })
      }

      const result = await client.querySingle(`
        insert Device {
          name := <str>$deviceName
        };
      `, { deviceName })

      return NextResponse.json(result, { status: 201 })
    }

    // Create vote (existing logic)
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json({ error: "deviceId is required and must be a string" }, { status: 400 })
    }

    if (!voteValue || typeof voteValue !== "number" || voteValue < 1 || voteValue > 5) {
      return NextResponse.json({ error: "voteValue is required and must be a number between 1 and 5" }, { status: 400 })
    }

    // Insert the vote using device UUID
    const result = await client.querySingle(`
      insert Vote {
        value := <int16>$voteValue,
        device := (select Device filter .id = <uuid>$deviceId)
      };
    `, { 
      voteValue,
      deviceId
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating vote or device:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}