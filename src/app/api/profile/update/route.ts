import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Get the server-side session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Find the user by ID from the session
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Return user profile data
    return NextResponse.json({ 
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || '/default-avatar.png',
        bio: user.bio || '',
        readingGoal: user.readingGoal || 50,
        readingStats: {
          totalRead: user.readingStats?.totalRead || 0,
          completed: user.readingStats?.completed || 0
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the server-side session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Parse form data
    const formData = await request.formData()
    
    // Prepare update object
    const updateData: any = {
      name: formData.get('name')?.toString(),
      bio: formData.get('bio')?.toString(),
      readingGoal: parseInt(formData.get('readingGoal')?.toString() || '50')
    }

    // Handle avatar upload
    const avatarFile = formData.get('avatar') as File | string
    if (avatarFile && (typeof avatarFile === 'string' || avatarFile.size > 0)) {
      let avatarPath: string | null = null

      // Check if it's a preset avatar path
      const presetAvatarPaths = [
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

      if (typeof avatarFile === 'string' && presetAvatarPaths.includes(avatarFile)) {
        // If it's a preset avatar path, use it directly
        avatarPath = avatarFile
      } else if (avatarFile instanceof File) {
        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!validTypes.includes(avatarFile.type)) {
          return NextResponse.json({ 
            error: 'Invalid file type. Please upload JPEG, PNG, or GIF.' 
          }, { status: 400 })
        }

        if (avatarFile.size > maxSize) {
          return NextResponse.json({ 
            error: 'File is too large. Maximum size is 5MB.' 
          }, { status: 400 })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = avatarFile.name.split('.').pop()
        const filename = `avatar-${session.user.id}-${timestamp}.${fileExtension}`
        
        // Save file to public directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
        const filepath = path.join(uploadDir, filename)
        
        // Ensure directory exists
        await writeFile(filepath, Buffer.from(await avatarFile.arrayBuffer()))

        // Update avatar path
        avatarPath = `/uploads/avatars/${filename}`
      }

      // If an avatar path was generated or provided, update the user
      if (avatarPath) {
        updateData.avatar = avatarPath
      }
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id, 
      updateData, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validations
      }
    )

    if (!updatedUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Return updated user profile data
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar || '/default-avatar.png',
        bio: updatedUser.bio || '',
        readingGoal: updatedUser.readingGoal || 50,
        readingStats: {
          totalRead: updatedUser.readingStats?.totalRead || 0,
          completed: updatedUser.readingStats?.completed || 0
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile' 
    }, { status: 500 })
  }
}
