"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    inert=""
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (props['data-state'] === 'open') {
      // Remove aria-hidden from ancestors when dialog is open
      const ancestors = [];
      let element = contentRef.current;
      while (element && element !== document.body) {
        if (element.hasAttribute('aria-hidden')) {
          element.removeAttribute('aria-hidden');
          ancestors.push(element);
        }
        element = element.parentElement;
      }

      return () => {
        // Restore aria-hidden on cleanup
        ancestors.forEach(el => {
          el.setAttribute('aria-hidden', 'true');
        });
      };
    }
  }, [props['data-state']]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={(node) => {
          // Maintain both refs
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        inert={props['data-state'] === 'closed' ? '' : undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          // Focus the first focusable element
          const firstFocusable = contentRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          // Prevent escape from closing if there are nested dialogs
          if (document.querySelector('[role="dialog"]:not([aria-hidden="true"])')) {
            event.preventDefault();
          }
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          tabIndex={-1}
        >
          <Cross2Icon className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader, // ✅ Ensure this is included
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

