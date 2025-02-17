"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton, SkeletonGrid } from '@/components/ui/skeleton'
import { AddToListDialog } from '@/components/ui/add-to-list-dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { getClient } from '@/lib/client'
import { gql } from '@apollo/client'

// AniList GraphQL query for trending and popular manga
const MANGA_QUERIES = gql`
  query {
    trending: Page(page: 1, perPage: 24) {
      media(type: MANGA, sort: TRENDING_DESC) {
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
    popular: Page(page: 1, perPage: 24) {
      media(type: MANGA, sort: POPULARITY_DESC) {
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

// Search query for AniList
const SEARCH_MANGA_QUERY = gql`
  query SearchManga($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: MANGA, search: $search, sort: POPULARITY_DESC) {
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
      `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}&page[limit]=1`
    )
    if (!response.ok) return null
    
    const data = await response.json()
    return data.data[0]?.attributes?.posterImage?.original || null
  } catch (error) {
    console.error('Error fetching Kitsu image:', error)
    return null
  }
}

export default function Explore() {
  // State for manga data
  const [mangaData, setMangaData] = useState({
    trending: [],
    popular: [],
    searchResults: []
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Fetch data when component mounts
  useEffect(() => {
    async function fetchMangaData() {
      try {
        const client = getClient()
        const { data } = await client.query({
          query: MANGA_QUERIES,
        })

        // Process both trending and popular manga
        const processMedia = async (media: any[]) => {
          return Promise.all(
            media.map(async (manga: any) => {
              const searchTitle = manga.title.english || manga.title.romaji
              const kitsuImage = await getKitsuImageUrl(searchTitle)
              return {
                ...manga,
                displayTitle: manga.title.english || manga.title.romaji,
                coverImage: kitsuImage || manga.coverImage.large,
              }
            })
          )
        }

        const trending = await processMedia(data.trending.media)
        const popular = await processMedia(data.popular.media)

        setMangaData(prev => ({ ...prev, trending, popular }))
      } catch (error) {
        console.error('Error fetching manga:', error)
      }
    }
    fetchMangaData()
  }, [])

  // Search function
  const searchManga = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const client = getClient()
      const { data } = await client.query({
        query: SEARCH_MANGA_QUERY,
        variables: {
          search: searchQuery,
          page: 1,
          perPage: 24
        }
      })

      // Process search results
      const processMedia = async (media: any[]) => {
        return Promise.all(
          media.map(async (manga: any) => {
            const searchTitle = manga.title.english || manga.title.romaji
            const kitsuImage = await getKitsuImageUrl(searchTitle)
            return {
              ...manga,
              displayTitle: manga.title.english || manga.title.romaji,
              coverImage: kitsuImage || manga.coverImage.large,
            }
          })
        )
      }

      const searchResults = await processMedia(data.Page.media)
      setMangaData(prev => ({ ...prev, searchResults }))
    } catch (error) {
      console.error('Error searching manga:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToList = async (manga: any, status: string) => {
    try {
      // Prepare manga data for library
      const mangaToAdd = {
        id: manga.id,
        title: manga.displayTitle || manga.title?.romaji || manga.title?.english,
        coverImage: manga.coverImage,
        status: status,
        progress: 0, // Default progress
        totalChapters: manga.chapters || null,
        averageScore: manga.averageScore,
        genres: manga.genres,
        addedAt: new Date().toISOString()
      }

      // Adding to library with more robust error handling
      const response = await fetch('/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mangaToAdd)
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Throw an error with the specific error message from the backend
        throw new Error(responseData.error || 'Failed to add manga to library')
      }

      // Success notification (replace with a proper toast system later)
      alert(`Successfully added ${mangaToAdd.title} to ${status} list`)

      // Optional: Update local state or trigger a refetch of library data
      // This would depend on your state management approach
      return responseData.manga
    } catch (error) {
      // More detailed error logging
      console.error('Error adding manga to library:', error)
      
      // User-friendly error notification
      alert(error instanceof Error ? error.message : 'An unexpected error occurred')
      
      // Optionally rethrow to allow caller to handle the error
      throw error
    }
  }

  const MangaGrid = ({ manga, title, isSearchResult = false }: { 
    manga: any[], 
    title: string, 
    isSearchResult?: boolean 
  }) => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      setIsLoading(manga.length === 0)
    }, [manga])

    if (isLoading) {
      return (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">{title}</h2>
          <SkeletonGrid count={6} />
        </section>
      )
    }

    return (
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        {manga.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    {!isSearchResult ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-xs hover:bg-transparent">
                            Manage List
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => handleAddToList(manga, 'CURRENT')}>
                            Currently Reading
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAddToList(manga, 'PLANNING')}>
                            Plan to Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAddToList(manga, 'COMPLETED')}>
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAddToList(manga, 'DROPPED')}>
                            Dropped
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleAddToList(manga, 'PAUSED')}>
                            Paused
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <AddToListDialog 
                        manga={manga} 
                        onAddToList={(status, progress) => handleAddToList(manga, status)}
                      />
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No manga found
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Welcome Header */}
      <header className="mb-8">
        <div className="flex flex-col items-center gap-6 mb-4">
          <h1 className="text-2xl font-semibold">Explore</h1>
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search manga..."
              className="w-full pl-4 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchManga()
                }
              }}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground"
              onClick={searchManga}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Go'}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              □ Dashboard
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                📖 My List <span className="ml-2 opacity-50">...</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/library?section=reading">
                  Currently Reading
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?section=plan">
                  Plan to Read
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?section=finished">
                  Finished
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?section=dropped">
                  Dropped
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Manga Sections */}
      {mangaData.searchResults.length > 0 ? (
        <MangaGrid 
          manga={mangaData.searchResults} 
          title={`Search Results for "${searchQuery}"`}
          isSearchResult={true}
        />
      ) : (
        <>
          {mangaData.trending.length > 0 ? (
            <MangaGrid 
              manga={mangaData.trending} 
              title="Trending Manga" 
            />
          ) : (
            <SkeletonGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </SkeletonGrid>
          )}
          {mangaData.popular.length > 0 ? (
            <MangaGrid 
              manga={mangaData.popular} 
              title="Popular Manga" 
            />
          ) : (
            <SkeletonGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </SkeletonGrid>
          )}
        </>
      )}
    </div>
  )
}
