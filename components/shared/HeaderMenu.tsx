"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export function HeaderMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 shrink-0 text-brand md:hidden" aria-label="Open navigation menu"><Menu className="size-6" /></Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} className="w-80 max-w-[85vw] gap-0 p-5">
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <SheetTitle className="text-brand">Menu</SheetTitle>
          <SheetClose asChild><Button variant="ghost" size="icon" aria-label="Close navigation menu"><X /></Button></SheetClose>
        </div>
        <SheetDescription className="sr-only">Navigate between Cleanin pages.</SheetDescription>
        <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-1">
          {links.map((link) => <SheetClose asChild key={link.href}><Link href={link.href} aria-current={path === link.href ? "page" : undefined} className="rounded-lg px-4 py-3 font-medium text-brand hover:bg-brand-50 aria-[current=page]:bg-brand-50">{link.label}</Link></SheetClose>)}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
