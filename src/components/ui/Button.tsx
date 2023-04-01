import { cva, type VariantProps } from "class-variance-authority";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-semibold rounded-lg px-5 py-2.5 mr-2 mb-2 focus:outline-none transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-yellow-600 hover:bg-yellow-700 text-yellow-50",
        twitch: "bg-purple-700 hover:bg-purple-800 text-purple-50",
        success: "bg-green-600 hover:bg-green-700 text-green-50",
        transparent: "bg-neutral-900/25 hover:bg-neutral-900/50",
        danger: "bg-red-600 hover:bg-red-700 text-red-50",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export default function Button({
  variant,
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, className })} {...props}>
      {startIcon && <span className="mr-1.5">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1.5">{endIcon}</span>}
    </button>
  );
}
