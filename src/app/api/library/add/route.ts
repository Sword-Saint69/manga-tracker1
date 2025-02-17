import { NextRequest, NextResponse } from 'next/server'

// Define the structure of the library
interface MangaLibrary {
  manga: Array<{
    id: string;
    title: string;
    coverImage: string;
    status: string;
    progress: number;
    totalChapters?: number | null;
    averageScore?: number;
    genres?: string[];
    createdAt?: string;
    updatedAt?: string;
  }>;
}

// Mock database to store user's manga library
const getMockLibrary = async (request: NextRequest) => {
  const libraryJson = request.cookies.get('userLibrary')?.value
  return libraryJson 
    ? JSON.parse(libraryJson) 
    : { manga: [] }
}

const saveMockLibrary = async (library: MangaLibrary, response: NextResponse) => {
  response.cookies.set('userLibrary', JSON.stringify(library), {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (you'd replace this with actual auth check)
    const isAuthenticated = true // Placeholder

    if (!isAuthenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Parse incoming manga data
    const mangaData = await request.json()

    // Validate manga data
    if (!mangaData.id || !mangaData.title) {
      return NextResponse.json({ 
        error: 'Invalid manga data' 
      }, { status: 400 })
    }

    // Get current library
    const library = await getMockLibrary(request)

    // Check if manga already exists in library
    const existingMangaIndex = library.manga.findIndex(
      (m: any) => m.id === mangaData.id
    )

    if (existingMangaIndex !== -1) {
      // Update existing manga entry
      library.manga[existingMangaIndex] = {
        ...library.manga[existingMangaIndex],
        ...mangaData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new manga to library
      library.manga.push({
        ...mangaData,
        createdAt: new Date().toISOString()
      })
    }

    // Prepare response
    const response = NextResponse.json({ 
      message: 'Manga added to library successfully',
      manga: mangaData
    }, { status: 200 })

    // Save updated library
    await saveMockLibrary(library, response)

    return response

  } catch (error) {
    console.error('Error adding manga to library:', error)
    return NextResponse.json({ 
      error: 'Failed to add manga to library' 
    }, { status: 500 })
  }
}

// GET route to retrieve library
export async function GET(request: NextRequest) {
  try {
    // Retrieve library from cookies
    const library = await getMockLibrary(request)

    // Optional: Filter library based on query parameters
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (section) {
      const filteredLibrary = {
        manga: library.manga.filter(manga => 
          manga.status.toLowerCase() === section.toLowerCase()
        )
      }
      return NextResponse.json(filteredLibrary, { status: 200 })
    }

    return NextResponse.json(library, { status: 200 })
  } catch (error) {
    console.error('Error retrieving library:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve library' 
    }, { status: 500 })
  }
}
