import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Note: Ensure @radix-ui/react-slot is installed or remove Slot usage if not needed. 
// For this simple implementation without Radix for now, I will simulate it or just use standard props.
// Actually, I'll stick to simple props for now to avoid extra deps unless requested.

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary-600 text-white hover:bg-primary-700',
                destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90',
                outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
                secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
                ghost: 'hover:bg-slate-100 hover:text-slate-900',
                link: 'text-slate-900 underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-12 px-4 py-2', // Taller for mobile touch targets
                sm: 'h-9 rounded-xl px-3',
                lg: 'h-14 rounded-2xl px-8',
                icon: 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
