import { cva, type VariantProps } from "class-variance-authority";

const buttonStyles = cva(
  "px-5 py-2 transition-colors inline-flex items-center justify-center focus:outline-none rounded tracking-wider font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-400 hover:to-blue-600 text-black",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export default function Button({ variant, className, ...props }: ButtonProps) {
  return <button className={buttonStyles({ variant, className })} {...props} />;
}
