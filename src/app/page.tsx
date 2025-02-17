import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const trendingManga = [
  {
    id: 1,
    title: 'Sakamoto Days',
    cover: '/manga/sakamoto-days.jpg',
    description: 'Taro Sakamoto was the ultimate assassin, feared b...',
    genres: ['Action', 'Comedy'],
    status: 'Ongoing',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Kagurabachi',
    cover: '/manga/kagurabachi.jpg',
    description: 'Young Chinese swordsmith is a...',
    genres: ['Action', 'Drama'],
    status: 'Ongoing',
    rating: 4.5,
  },
  {
    id: 3,
    title: 'Blue Box',
    cover: '/manga/blue-box.jpg',
    description: 'Taiki Inomata is on the boys badminton team at sports...',
    genres: ['Romance', 'Slice of Life'],
    status: 'Ongoing',
    rating: 4.7,
  },
  {
    id: 4,
    title: 'SPY × FAMILY',
    cover: '/manga/spy-family.jpg',
    description: 'The master spy codenamed "Twilight" has spent...',
    genres: ['Action', 'Comedy', 'Slice of Life'],
    status: 'Ongoing',
    rating: 4.9,
  },
  {
    id: 5,
    title: 'Ichi the Witch',
    cover: '/manga/ichi-witch.jpg',
    description: 'In this world, witches must hunt down their cursed De...',
    genres: ['Fantasy'],
    status: 'Ongoing',
    rating: 4.6,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Welcome Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Welcome, SWORD_DEMON!</h1>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/discover" className="text-sm text-muted-foreground hover:text-primary">
            → Discover
          </Link>
          <Link href="/my-list" className="text-sm text-muted-foreground hover:text-primary">
            ↑ My List
          </Link>
        </div>
        {/* Search Bar */}
        <div className="relative max-w-md">
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
      </header>

      {/* Trending Section */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {trendingManga.map((manga) => (
            <Card key={manga.id} className="border-0 bg-card/50">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                      {manga.rating}
                    </Badge>
                  </div>
                  <Image
                    src={manga.cover}
                    alt={manga.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-medium line-clamp-1">{manga.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {manga.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {manga.genres.map((genre) => (
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
                    {manga.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Add to My List
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
