'use client'

import { ReactNode } from 'react'
import { motion, MotionProps } from 'framer-motion'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </motion.div>
  )
}
