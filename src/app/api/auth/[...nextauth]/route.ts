import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const handler = NextAuth({
  adapter: MongoDBAdapter(
    // Wrap the connection in a way that returns a MongoClient-like object
    (async () => {
      await connectDB()
      return {
        db: () => {
          const db = mongoose.connection.db
          return db
        },
        client: mongoose.connection.getClient()
      }
    })()
  ),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email }).select('+password')

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordCorrect) {
          throw new Error('Invalid password')
        }

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name 
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }
