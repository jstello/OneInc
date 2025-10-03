import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

interface StatusMessageProps {
  type: "error" | "success" | "info" | "warning"
  message: string
  className?: string
  showIcon?: boolean
}

const StatusMessage = React.forwardRef<HTMLDivElement, StatusMessageProps>(
  ({ type, message, className, showIcon = true }, ref) => {
    const config = {
      error: {
        icon: XCircle,
        styles: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
        iconStyles: "text-red-500",
        role: "alert",
      },
      success: {
        icon: CheckCircle,
        styles: "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
        iconStyles: "text-green-500",
        role: "status",
      },
      info: {
        icon: Info,
        styles: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
        iconStyles: "text-blue-500",
        role: "status",
      },
      warning: {
        icon: AlertCircle,
        styles: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
        iconStyles: "text-yellow-500",
        role: "alert",
      },
    }

    const { icon: Icon, styles, iconStyles, role } = config[type]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center p-4 border rounded-lg animate-fade-in transition-all duration-300",
          styles,
          className
        )}
        role={role}
        aria-live="polite"
        aria-atomic="true"
      >
        {showIcon && <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", iconStyles)} />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    )
  }
)

StatusMessage.displayName = "StatusMessage"

export { StatusMessage }