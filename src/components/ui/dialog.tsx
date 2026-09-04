"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          /*
           * The dialog is capped and scrolls. Without this a form taller
           * than the window is centred on it and clipped at *both* ends,
           * with nothing to scroll — the fields past the fold, and the
           * button that saves them, simply cannot be reached on a phone.
           *
           * `dvh` rather than `vh`: on mobile Safari `vh` is the height with
           * the browser chrome retracted, which is taller than what is
           * actually on screen, so a `vh` cap still hides the last rows.
           */
          "fixed z-50 flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-4 overflow-y-auto overscroll-contain bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none",
          // Phones: a sheet on the bottom edge. It reaches further up the
          // window than a centred box can, and it puts the form's controls
          // where the thumb already is rather than in the middle of the
          // screen.
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))] data-open:animate-in data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:slide-out-to-bottom-8",
          // From `sm` up it is a centred dialog again.
          "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[calc(100dvh-4rem)] sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-4 sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95 sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95",
          "data-open:fade-in-0 data-closed:fade-out-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2 size-9 sm:size-7"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      // `pr-8` keeps the title clear of the close button in the corner.
      className={cn("flex flex-col gap-2 pr-8", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        /*
         * The footer bleeds to the dialog's edges. On a phone the sheet
         * carries the home-indicator inset as bottom padding, so the footer
         * has to pull past that too and take the inset onto its own padding
         * — otherwise its tinted band stops short and leaves a strip of a
         * different colour along the bottom of the screen.
         */
        "-mx-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4",
        "max-sm:-mb-[max(1rem,env(safe-area-inset-bottom))] max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:[&_[data-slot=button]]:h-11",
        "sm:-mb-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
