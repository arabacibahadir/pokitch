import { cva, type VariantProps } from "class-variance-authority";

const buttonStyles = cva(
  "px-5 py-2 transition-colors inline-flex items-center justify-center focus:outline-none rounded tracking-wider font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-400 hover:bg-blue-500 text-black",
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
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
}
