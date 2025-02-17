import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Manga from '@/models/Manga'

export async function GET() {
  try {
    await connectDB()

    // Fetch manga updated in the last 30 days, sorted by update time
    const recentUpdates = await Manga.find({
      updatedAt: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      }
    })
    .sort({ updatedAt: -1 })
    .limit(10)

    return NextResponse.json(recentUpdates)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
