import * as React from "react"
import { cn } from "@/lib/utils"

const labelVariants = (
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants, className)}
    {...props}
  >
    {children}
  </label>
))
Label.displayName = 'Label'

export { Label }
