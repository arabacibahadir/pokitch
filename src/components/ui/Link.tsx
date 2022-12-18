import NextLink, { type LinkProps as NextLinkProps } from "next/link";

type Props = React.ComponentPropsWithoutRef<"a"> & NextLinkProps;

export default function Link({ ...props }: Props) {
  return (
    <NextLink
      className="font-semibold text-yellow-400 transition-colors hover:text-yellow-600"
      {...props}
    />
  );
}
