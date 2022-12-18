import { cva, VariantProps } from "class-variance-authority";

const headingStyles = cva("font-bold leading-tight", {
  variants: {
    variant: {
      h1: "text-5xl",
      h2: "text-3xl",
      h3: "text-2xl",
      h4: "text-xl",
      h5: "text-lg",
      h6: "text-base",
    },
  },
  defaultVariants: {
    variant: "h6",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingStyles> {}

export default function Heading({ variant, ...props }: HeadingProps) {
  let HeadingComponent = variant ?? "h6";
  return <HeadingComponent className={headingStyles({ variant })} {...props} />;
}
