
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'; // Optional: Add icons

import { cn } from "@/lib/utils"

const alertVariants = cva(
  // Base styles with Material Design focus
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", // rounded-lg, adjusted icon padding
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border", // Explicit border
        destructive:
          "bg-destructive/10 border-destructive/30 text-destructive dark:border-destructive [&>svg]:text-destructive", // Adjusted bg/border
        // Optional: Add success/warning/info variants if needed, following M3 color roles
        // success: "bg-green-100/50 border-green-500/50 text-green-800 dark:bg-green-900/30 dark:border-green-600/50 dark:text-green-300 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        // warning: "bg-yellow-100/50 border-yellow-500/50 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600/50 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        // info: "bg-blue-100/50 border-blue-500/50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600/50 dark:text-blue-300 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
      {/* Optional: Auto-add icon based on variant */}
      {/* {variant === 'destructive' && !React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === AlertTriangle) && <AlertTriangle className="h-4 w-4" />}
      {variant === 'success' && !React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === CheckCircle) && <CheckCircle className="h-4 w-4" />}
      {variant === 'warning' && !React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === AlertTriangle) && <AlertTriangle className="h-4 w-4" />}
      {variant === 'info' && !React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === Info) && <Info className="h-4 w-4" />} */}
    {children}
  </div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => ( // Added children
  <h5 // Use h5 for semantic structure
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >{children}</h5> // Render children
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => ( // Added children
  <div // Keep as div to allow nested p tags if needed by markdown, etc.
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  >{children}</div> // Render children
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
