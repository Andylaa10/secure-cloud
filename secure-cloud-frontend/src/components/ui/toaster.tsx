import {useToast} from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const {toasts} = useToast()

  return (
      <ToastProvider>
        {toasts.map(function ({id, title, subTitle, icon, description, action, ...props}) {
          return (
              <Toast key={id} {...props}>
                <div className="flex items-center gap-3">
                  {icon && <div className="text-foreground">{icon}</div>}
                  <div className="flex flex-col">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {subTitle && <ToastTitle>{subTitle}</ToastTitle>}
                  </div>
                  {description && (
                      <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose/>
              </Toast>
          )
        })}
        <ToastViewport/>
      </ToastProvider>
  )
}
