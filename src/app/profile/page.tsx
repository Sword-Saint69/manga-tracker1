"use client"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Lock, 
  BookOpen, 
  Star, 
  Edit,
  Upload,
  LogIn
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { SessionProvider, useSession, signIn } from "next-auth/react"

// Custom Toast Component
const Toast = ({ 
  message, 
  type = 'info' 
}: { 
  message: string, 
  type?: 'success' | 'error' | 'info' 
}) => {
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
    >
      {message}
    </div>
  )
}

function ProfilePageContent() {
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Don't redirect, just show unauthenticated view
    }
  })

  const [user, setUser] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "/default-avatar.png",
    bio: "",
    readingGoal: 50,
    readingStats: {
      totalRead: 0,
      completed: 0
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({ ...user })
  const [toast, setToast] = useState<{ 
    message: string, 
    type?: 'success' | 'error' | 'info' 
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/profile/update')
        
        if (response.ok) {
          const data = await response.json()
          setUser(prevUser => ({
            ...prevUser,
            ...data.user
          }))
          setEditedUser(prevUser => ({
            ...prevUser,
            ...data.user
          }))
        } else {
          showToast("Failed to fetch profile", 'error')
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
        showToast("An unexpected error occurred", 'error')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserProfile()
    }
  }, [status])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      // Prepare form data for avatar upload
      const formData = new FormData()
      formData.append('name', editedUser.name)
      formData.append('bio', editedUser.bio)
      formData.append('readingGoal', editedUser.readingGoal.toString())

      // If there's an avatar preview, handle it
      if (avatarPreview && avatarPreview !== user.avatar) {
        // Check if it's a preset avatar
        const isPresetAvatar = presetAvatars.includes(avatarPreview)
        
        if (isPresetAvatar) {
          // For preset avatars, just send the path
          formData.append('avatar', avatarPreview)
        } else {
          // For uploaded avatars, convert to blob
          const response = await fetch(avatarPreview)
          const blob = await response.blob()
          formData.append('avatar', blob, 'avatar.jpg')
        }
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUser(prevUser => ({
          ...prevUser,
          ...data.user
        }))
        setIsEditing(false)
        setAvatarPreview(null)
        showToast("Profile updated successfully!", 'success')
      } else {
        const errorData = await response.json()
        showToast(errorData.error || "Failed to update profile", 'error')
      }
    } catch (error) {
      console.error("Profile update error:", error)
      showToast("An unexpected error occurred", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(file.type)) {
          showToast("Invalid file type. Please upload JPEG, PNG, or GIF.", 'error')
          return
        }

        if (file.size > maxSize) {
          showToast("File is too large. Maximum size is 5MB.", 'error')
          return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Avatar preview error:", error)
        showToast("Failed to process avatar", 'error')
      }
    }
  }

  // Preset avatars list
  const presetAvatars = [
    '/uploads/preset-avatars/avatar_1.png',
    '/uploads/preset-avatars/avatar_2.png',
    '/uploads/preset-avatars/avatar_3.png',
    '/uploads/preset-avatars/avatar_4.png',
    '/uploads/preset-avatars/avatar_5.png',
    '/uploads/preset-avatars/avatar_6.png',
    '/uploads/preset-avatars/avatar_7.png',
    '/uploads/preset-avatars/avatar_8.png',
    '/uploads/preset-avatars/avatar_9.png',
    '/uploads/preset-avatars/avatar_10.png'
  ]

  // Not authenticated view
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Profile Access Restricted
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to view and edit your profile
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => signIn()}
            >
              <LogIn className="mr-2 h-4 w-4" /> Log In
            </Button>
            <Link href="/auth/register" className="w-full">
              <Button className="w-full" variant="outline">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={avatarPreview || user.avatar} 
                    alt={`${user.name}'s avatar`} 
                  />
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <label 
                      htmlFor="avatar-upload" 
                      className="cursor-pointer bg-primary text-white rounded-full p-2 hover:bg-primary-dark"
                    >
                      <Upload className="h-4 w-4" />
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Input 
                      value={editedUser.bio}
                      onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div>
                    <Label>Reading Goal</Label>
                    <Input 
                      type="number"
                      value={editedUser.readingGoal}
                      onChange={(e) => setEditedUser({
                        ...editedUser, 
                        readingGoal: parseInt(e.target.value) || 0
                      })}
                      placeholder="Set your reading goal"
                    />
                  </div>
                  <div className="mt-4 w-full">
                    <Label>Or choose a preset avatar:</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {presetAvatars.map((avatarSrc, index) => (
                        <button 
                          key={index} 
                          onClick={() => setAvatarPreview(avatarSrc)}
                          className={`
                            rounded-full overflow-hidden border-2 
                            ${avatarPreview === avatarSrc 
                              ? 'border-primary' 
                              : 'border-transparent hover:border-muted-foreground'}
                            transition-all duration-200
                          `}
                        >
                          <img 
                            src={avatarSrc} 
                            alt={`Preset avatar ${index + 1}`} 
                            className="w-16 h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        setAvatarPreview(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="mt-2 text-sm">{user.bio}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reading Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Reading Statistics</CardTitle>
              <CardDescription>Track your manga reading progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <BookOpen className="w-8 h-8 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">Total Read</h3>
                  <p className="text-2xl font-bold">
                    {user.readingStats.totalRead} Manga
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <Star className="w-8 h-8 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">Completed</h3>
                  <p className="text-2xl font-bold">
                    {user.readingStats.completed} Series
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <Lock className="w-8 h-8 text-primary mb-2" />
                  <h3 className="text-lg font-semibold">Reading Goal</h3>
                  <p className="text-2xl font-bold">
                    {user.readingGoal} Manga
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function ProfilePage() {
  return (
    <SessionProvider>
      <ProfilePageContent />
    </SessionProvider>
  )
}
