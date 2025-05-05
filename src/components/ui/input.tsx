
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Adjusted styles for Material Design feel
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background", // Increased padding, rounded-lg, h-11 for more vertical space
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary", // Use focus:border-primary instead of focus-visible:border-primary
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200 ease-in-out", // Smooth transition
          "md:text-sm", // Keep responsive text size
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
