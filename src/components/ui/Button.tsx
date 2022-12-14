import { cva, type VariantProps } from "class-variance-authority";

const buttonStyles = cva(
  "inline-flex items-center justify-center text-white font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 hover:bg-blue-700",
        dark: "bg-gray-800 hover:bg-slate-700",
        green: "bg-green-600 hover:bg-green-700",
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
