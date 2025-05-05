
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
       // Adjusted styles for Material Design feel - Use rounded-xl
      "rounded-xl border bg-card text-card-foreground shadow-md",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)} // Standard padding
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement, // Changed to p for semantic correctness unless it strictly needs to be a heading div
  React.HTMLAttributes<HTMLHeadingElement> // Keep HTMLHeadingElement for props compatibility if needed
>(({ className, children, ...props }, ref) => ( // Added children prop
  <p // Use <p> or appropriate heading level (e.g., <h2>)
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight", // Adjusted size to text-xl
      className
    )}
    {...props}
   >{children}</p> // Render children
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => ( // Added children prop
  <p // Use <p>
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)} // Standard size
    {...props}
   >{children}</p> // Render children
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} /> // Standard padding
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)} // Standard padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
