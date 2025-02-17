import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    await connectDB()

    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    return NextResponse.json(
      { 
        message: 'User registered successfully', 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email 
        } 
      }, 
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
