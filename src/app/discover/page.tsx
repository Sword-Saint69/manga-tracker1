import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { getClient } from '@/lib/client'
import { gql } from '@apollo/client'

// AniList GraphQL queries
const MANGA_QUERIES = gql`
  query {
    newlyAdded: Page(page: 1, perPage: 5) {
      media(type: MANGA, sort: ID_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        genres
        status
        averageScore
        coverImage {
          large
          medium
        }
      }
    }
    recentlyUpdated: Page(page: 1, perPage: 5) {
      media(type: MANGA, status: RELEASING, sort: UPDATED_AT_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        genres
        status
        averageScore
        coverImage {
          large
          medium
        }
      }
    }
  }
`

// Function to get Kitsu image URL
const getKitsuImageUrl = async (title: string) => {
  try {
    const response = await fetch(
      `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}&page[limit]=1}`,
      { 
        signal: AbortSignal.timeout(3000) // 3 second timeout
      }
    )
    if (!response.ok) return null
    
    const data = await response.json()
    return data.data[0]?.attributes?.posterImage?.original || null
  } catch (error) {
    console.warn('Error fetching Kitsu image:', error)
    return null
  }
}

async function getMangaData() {
  try {
    const client = getClient()
    const { data } = await client.query({
      query: MANGA_QUERIES,
    })

    // Process both newly added and recently updated manga
    const processMedia = async (media: any[]) => {
      return Promise.all(
        media.map(async (manga: any) => {
          const searchTitle = manga.title.english || manga.title.romaji
          const kitsuImage = await getKitsuImageUrl(searchTitle)
          return {
            ...manga,
            displayTitle: manga.title.english || manga.title.romaji,
            coverImage: kitsuImage || manga.coverImage.large || '/default-manga-cover.jpg',
          }
        })
      )
    }

    const newlyAdded = await processMedia(data.newlyAdded.media)
    const recentlyUpdated = await processMedia(data.recentlyUpdated.media)

    return { newlyAdded, recentlyUpdated }
  } catch (error) {
    console.error('Error fetching manga:', error)
    return { newlyAdded: [], recentlyUpdated: [] }
  }
}

export default async function Discover() {
  const { newlyAdded, recentlyUpdated } = await getMangaData()

  const MangaGrid = ({ manga }: { manga: any[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {manga.map((manga: any) => (
        <Card key={manga.id} className="border-0 bg-card/50">
          <CardContent className="p-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className="bg-black/50 text-white backdrop-blur-sm text-xs px-2 py-0.5"
                >
                  {(manga.averageScore / 10).toFixed(1)}
                </Badge>
              </div>
              <Image
                src={manga.coverImage}
                alt={manga.displayTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-medium line-clamp-1">{manga.displayTitle}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {manga.description?.replace(/<[^>]*>/g, '') || 'No description available'}
              </p>
              <div className="flex flex-wrap gap-1">
                {manga.genres.slice(0, 2).map((genre: string) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <div className="flex items-center justify-between w-full">
              <Badge variant="secondary" className="text-xs">
                {manga.status === 'RELEASING' ? 'Ongoing' : manga.status}
              </Badge>
              <Button variant="ghost" size="sm" className="text-xs hover:bg-transparent">
                Add to My List
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Welcome Header */}
      <header className="mb-8">
        <div className="flex items-center gap-80 mb-4">
          <h1 className="text-2xl font-semibold">Discover Manga</h1>
          <div className="relative flex-grow max-w-md">
            <Input
              type="search"
              placeholder="Search manga..."
              className="w-full pl-4 pr-10"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground"
            >
              Go
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              □ Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/my-list">
              📖 My List
            </Link>
          </Button>
        </div>
      </header>

      {/* Newly Added Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Newly Added</h2>
        <MangaGrid manga={newlyAdded} />
      </section>

      {/* Recently Updated Section */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Recently Updated</h2>
        <MangaGrid manga={recentlyUpdated} />
      </section>
    </div>
  )
}
