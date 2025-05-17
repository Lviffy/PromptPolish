import { XCircle, CheckCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group rounded-lg shadow-lg p-4 mb-3 flex items-start w-80 transform transition-transform duration-300",
  {
    variants: {
      variant: {
        default: "bg-white border-l-4 border-primary",
        success: "bg-white border-l-4 border-status-success",
        destructive: "bg-white border-l-4 border-status-error",
        warning: "bg-white border-l-4 border-status-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastNotificationProps extends VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
}

export function ToastNotification({
  title,
  description,
  variant,
  onClose,
}: ToastNotificationProps) {
  // Icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="text-status-success h-5 w-5" />;
      case "destructive":
        return <XCircle className="text-status-error h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="mr-3">
        {getIcon()}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
