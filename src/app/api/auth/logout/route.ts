import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear authentication-related cookies
    const cookieStore = cookies()
    
    // Remove user-related cookies
    cookieStore.delete('userToken')
    cookieStore.delete('userLibrary')
    cookieStore.delete('userSession')

    // Return a successful logout response
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    }, { 
      status: 200,
      // Clear client-side cookies
      headers: {
        'Set-Cookie': [
          'userToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'userLibrary=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'userSession=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ]
      }
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      error: 'Failed to log out' 
    }, { status: 500 })
  }
}
