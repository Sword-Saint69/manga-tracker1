"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {}
})

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(DialogContext)

  return (
    <button
      ref={ref}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  )
})
DialogTrigger.displayName = 'DialogTrigger'

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(DialogContext)

  return (
    <button
      ref={ref}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  )
})
DialogClose.displayName = 'DialogClose'

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DialogContext)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
          className
        )}
        {...props}
      >
        <button 
          onClick={() => setOpen(false)} 
          className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("mb-4 space-y-2", className)} 
    {...props}
  >
    {children}
  </div>
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 
    className={cn("text-lg font-semibold", className)} 
    {...props}
  >
    {children}
  </h2>
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p 
    className={cn("text-sm text-muted-foreground", className)} 
    {...props}
  >
    {children}
  </p>
)
DialogDescription.displayName = 'DialogDescription'

const DialogFooter = ({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", 
      className
    )} 
    {...props}
  >
    {children}
  </div>
)
DialogFooter.displayName = 'DialogFooter'

export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
}
