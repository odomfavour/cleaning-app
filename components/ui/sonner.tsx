"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** shadcn's Sonner wrapper, themed with the CSS variables from globals.css. */
const Toaster = (props: ToasterProps) => (
  <Sonner
    className="toaster group"
    style={
      {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties
    }
    {...props}
  />
);

export { Toaster };
