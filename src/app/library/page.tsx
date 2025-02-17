"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { getClient } from '@/lib/client'
import { gql } from '@apollo/client'

// AniList GraphQL query for user's manga list
const USER_MANGA_LIST_QUERY = gql`
  query ($userId: Int!) {
    reading: MediaListCollection(userId: $userId, type: MANGA, status: CURRENT) {
      lists {
        entries {
          media {
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
    }
    completed: MediaListCollection(userId: $userId, type: MANGA, status: COMPLETED) {
      lists {
        entries {
          media {
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
    }
    planToRead: MediaListCollection(userId: $userId, type: MANGA, status: PLANNING) {
      lists {
        entries {
          media {
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
    }
    dropped: MediaListCollection(userId: $userId, type: MANGA, status: DROPPED) {
      lists {
        entries {
          media {
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
    }
  }
`

// Function to get user's manga list
async function getUserMangaList() {
  try {
    const client = getClient()
    const { data } = await client.query({
      query: USER_MANGA_LIST_QUERY,
      variables: {
        userId: 123, // Replace with actual user ID
      }
    })

    // Process manga lists
    const processMediaList = (list: any) => 
      list.lists.flatMap(listGroup => 
        listGroup.entries.map(entry => {
          const manga = entry.media
          return {
            ...manga,
            displayTitle: manga.title.english || manga.title.romaji,
            coverImage: manga.coverImage.large,
          }
        })
      )

    return {
      reading: processMediaList(data.reading),
      completed: processMediaList(data.completed),
      planToRead: processMediaList(data.planToRead),
      dropped: processMediaList(data.dropped)
    }
  } catch (error) {
    console.error('Error fetching user\'s manga list:', error)
    return { reading: [], completed: [], planToRead: [], dropped: [] }
  }
}

export default function Library() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Determine which section to highlight based on search params
  const activeSection = searchParams.get('section') || 'reading'

  // Fetch data on the client side
  const [mangaData, setMangaData] = useState({
    reading: [],
    completed: [],
    planToRead: [],
    dropped: []
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchMangaData() {
      const data = await getUserMangaList()
      setMangaData(data)
    }
    fetchMangaData()
  }, [])

  const { reading, completed, planToRead, dropped } = mangaData

  // Filter function for search
  const filterManga = (manga: any[]) => {
    if (!searchQuery) return manga

    const lowercaseQuery = searchQuery.toLowerCase()
    return manga.filter(item => 
      item.displayTitle.toLowerCase().includes(lowercaseQuery) ||
      item.genres.some((genre: string) => genre.toLowerCase().includes(lowercaseQuery))
    )
  }

  const MangaGrid = ({ manga, emptyMessage, isActive }: { 
    manga: any[], 
    emptyMessage?: string, 
    isActive?: boolean 
  }) => {
    const filteredManga = filterManga(manga)
    
    return filteredManga.length > 0 ? (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${isActive ? '' : 'hidden'}`}>
        {filteredManga.map((manga: any) => (
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
                  Remove
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <div className={`text-center text-muted-foreground py-8 ${isActive ? '' : 'hidden'}`}>
        {emptyMessage || 'No manga found'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Welcome Header */}
      <header className="mb-8">
        <div className="flex items-center gap-80 mb-4">
          <h1 className="text-2xl font-semibold">My Library</h1>
          <div className="relative flex-grow max-w-md">
            <Input
              type="search"
              placeholder="Search my library..."
              className="w-full pl-4 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground"
              onClick={() => {/* Optional: add additional search logic if needed */}}
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
            <Link href="/explore">
              ✎ Explore
            </Link>
          </Button>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="flex mb-6 space-x-4 border-b pb-2">
        <button 
          className={`px-4 py-2 ${activeSection === 'reading' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => router.push('/library?section=reading')}
        >
          Currently Reading
        </button>
        <button 
          className={`px-4 py-2 ${activeSection === 'plan' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => router.push('/library?section=plan')}
        >
          Plan to Read
        </button>
        <button 
          className={`px-4 py-2 ${activeSection === 'finished' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => router.push('/library?section=finished')}
        >
          Finished
        </button>
        <button 
          className={`px-4 py-2 ${activeSection === 'dropped' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => router.push('/library?section=dropped')}
        >
          Dropped
        </button>
      </div>

      {/* Manga Sections */}
      <MangaGrid 
        manga={reading} 
        emptyMessage="Start reading some manga!" 
        isActive={activeSection === 'reading'}
      />
      <MangaGrid 
        manga={planToRead} 
        emptyMessage="Add manga you want to read later" 
        isActive={activeSection === 'plan'}
      />
      <MangaGrid 
        manga={completed} 
        emptyMessage="Complete some manga to see them here" 
        isActive={activeSection === 'finished'}
      />
      <MangaGrid 
        manga={dropped} 
        emptyMessage="Manga you've decided to stop reading" 
        isActive={activeSection === 'dropped'}
      />
    </div>
  )
}
