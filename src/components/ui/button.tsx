
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-[0.96]", 
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-gradient-to-b from-[hsl(var(--primary-h)_var(--primary-s)_calc(var(--primary-l)_+_5%))] to-[hsl(var(--primary-h)_var(--primary-s)_calc(var(--primary-l)_-_5%))] hover:from-[hsl(var(--primary-h)_var(--primary-s)_var(--primary-l))] hover:to-[hsl(var(--primary-h)_var(--primary-s)_calc(var(--primary-l)_-_10%))] active:brightness-[0.85]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-gradient-to-b from-[hsl(var(--destructive-h,0)_var(--destructive-s,70%)_calc(var(--destructive-l,45%)_+_5%))] to-[hsl(var(--destructive-h,0)_var(--destructive-s,70%)_calc(var(--destructive-l,45%)_-_5%))] hover:from-[hsl(var(--destructive-h,0)_var(--destructive-s,70%)_var(--destructive-l,45%))] hover:to-[hsl(var(--destructive-h,0)_var(--destructive-s,70%)_calc(var(--destructive-l,45%)_-_10%))] active:brightness-[0.85]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gradient-to-b from-[hsl(var(--secondary-h)_var(--secondary-s)_calc(var(--secondary-l)_+_5%))] to-[hsl(var(--secondary-h)_var(--secondary-s)_calc(var(--secondary-l)_-_5%))] hover:from-[hsl(var(--secondary-h)_var(--secondary-s)_var(--secondary-l))] hover:to-[hsl(var(--secondary-h)_var(--secondary-s)_calc(var(--secondary-l)_-_10%))] active:brightness-[0.85]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/70",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        xs: "h-8 rounded-md px-2.5 text-xs", // Added xs size for more compact buttons
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

