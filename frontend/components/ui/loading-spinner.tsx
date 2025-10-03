import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default" }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    }

    const variantClasses = {
      default: "text-gray-600 dark:text-gray-400",
      primary: "text-blue-600 dark:text-blue-400",
      secondary: "text-gray-400 dark:text-gray-600",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }