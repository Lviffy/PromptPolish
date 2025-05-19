import React from "react";
import { ToastNotification } from "./toast-notification";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-h-screen overflow-hidden">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <ToastNotification
          key={id}
          title={title as string}
          description={description as string}
          variant={variant as "default" | "success" | "destructive" | "warning"}
          onClose={() => dismiss(id)}
        />
      ))}
    </div>
  );
}
