import NextLink, { type LinkProps as NextLinkProps } from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black py-6">
      <div className="container">
        <div className="flex flex-col items-center gap-y-2">
          <p>
            <Link href="/">Pokewars</Link> is an open-source initiative.{" "}
            <Link href="/" target="_blank" rel="noreferrer">
              Contribute!
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

type Props = React.ComponentPropsWithoutRef<"a"> & NextLinkProps;

const Link = ({ href, ...props }: Props) => {
  return (
    <NextLink
      href={href}
      className="font-semibold text-yellow-400 transition-colors hover:text-yellow-600"
      {...props}
    />
  );
};
