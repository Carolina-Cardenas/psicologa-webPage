import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // FIJAMOS EL ANCHO AQUÍ (450px es un buen tamaño grande)
      className={cn("p-6 bg-white rounded-2xl border shadow-xl w-[450px]", className)}
      classNames={{
        months: "w-full",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-2 relative items-center h-12 mb-4",
        caption_label: "text-xl font-bold tracking-tight", 
        nav: "flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 absolute left-1 z-10 rounded-full"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 absolute right-1 z-10 rounded-full"
        ),
        month_grid: "w-full mx-auto",
        weekdays: "flex justify-between w-full mb-2",
        weekday: "text-muted-foreground w-14 font-semibold text-base text-center", 
        week: "flex w-full mt-2 justify-between",
        day: "h-14 w-14 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-14 w-14 p-0 text-lg font-medium transition-all hover:bg-accent hover:text-accent-foreground rounded-xl"
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-xl shadow-md"
        ),
        today: "bg-accent/50 text-accent-foreground rounded-xl",
        outside: "text-muted-foreground/20 opacity-30",
        disabled: "text-muted-foreground/10 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-6 w-6" />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };