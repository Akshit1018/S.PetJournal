import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-transform duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/70",
  {
    variants: {
      variant: {
        default: "bg-ink text-card hover:bg-ink/90",
        sun: "bg-sun text-sun-ink hover:bg-sun/90",
        sky: "bg-sky text-card hover:bg-sky-deep",
        outline: "border border-line bg-card text-ink hover:bg-canvas",
        ghost: "text-ink hover:bg-blush/50",
        soft: "bg-sky-soft text-ink hover:bg-sky-soft/80",
      },
      size: {
        default: "h-11 rounded-md px-4 text-sm",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-lg px-5 text-base",
        icon: "size-11 rounded-full",
        pill: "h-9 rounded-full px-3.5 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
