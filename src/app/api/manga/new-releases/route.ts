import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Manga from '@/models/Manga'

export async function GET() {
  try {
    await connectDB()

    // Fetch manga released in the last 7 days, sorted by latest chapter
    const newReleases = await Manga.find({
      'latestChapter.releaseDate': { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    })
    .sort({ 'latestChapter.releaseDate': -1 })
    .limit(10)

    return NextResponse.json(newReleases)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
