"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const d = getDefaultClassNames();
  const navBtn = cn(buttonVariants({ variant: "ghost" }), "size-8 h-8 p-0 select-none aria-disabled:opacity-40");
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", d.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row", d.months),
        month: cn("flex w-full flex-col gap-4", d.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between", d.nav),
        button_previous: cn(navBtn, d.button_previous),
        button_next: cn(navBtn, d.button_next),
        month_caption: cn("flex h-8 w-full items-center justify-center px-8", d.month_caption),
        caption_label: cn("text-sm font-medium select-none", d.caption_label),
        dropdowns: cn("flex h-8 items-center justify-center gap-1.5 text-sm font-medium", d.dropdowns),
        dropdown_root: cn("relative rounded-md border border-input shadow-xs", d.dropdown_root),
        dropdown: cn("absolute inset-0 opacity-0", d.dropdown),
        months_dropdown: d.months_dropdown,
        years_dropdown: d.years_dropdown,
        table: "w-full border-collapse",
        weekdays: cn("flex", d.weekdays),
        weekday: cn("flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none", d.weekday),
        week: cn("mt-2 flex w-full", d.week),
        day: cn("group/day relative aspect-square h-full w-full p-0 text-center select-none", d.day),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
          d.day_button,
        ),
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:font-semibold [&>button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-60",
        disabled: "text-muted-foreground opacity-40 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...rest }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : orientation === "right" ? ChevronRightIcon : ChevronDownIcon;
          return <Icon className={cn("size-4", className)} {...rest} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
