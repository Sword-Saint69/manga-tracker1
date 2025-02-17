"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

const Select = ({ 
  value, 
  onValueChange, 
  children, 
  placeholder, 
  className 
}: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange, 
      isOpen, 
      setIsOpen 
    }}>
      <div 
        ref={selectRef} 
        className={cn("relative w-full", className)}
      >
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  value: '',
  onValueChange: () => {},
  isOpen: false,
  setIsOpen: () => {}
})

const SelectTrigger = React.forwardRef<
  HTMLButtonElement, 
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value, isOpen, setIsOpen } = React.useContext(SelectContext)

  return (
    <button
      ref={ref}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {value || children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = React.forwardRef<
  HTMLSpanElement, 
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(SelectContext)

  return (
    <span 
      ref={ref} 
      className={cn("", className)}
      {...props}
    >
      {value || children}
    </span>
  )
})
SelectValue.displayName = 'SelectValue'

const SelectContent = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <div 
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in slide-in-from-top-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleSelect = () => {
    onValueChange(value)
    setIsOpen(false)
  }

  return (
    <div
      ref={ref}
      role="option"
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = 'SelectItem'

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
}
