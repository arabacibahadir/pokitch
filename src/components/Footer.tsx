import Link from "next/link";

const linkClassName =
  "font-semibold text-primary underline-offset-4 hover:underline";

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-border bg-background/90 py-8">
      <div className="container">
        <div className="flex flex-col gap-1 text-center text-sm text-muted-foreground">
          <p>
            <Link className={linkClassName} href="/">
              Pokitch
            </Link>{" "}
            is an open-source project.{" "}
            <Link
              className={linkClassName}
              href="https://github.com/pokitch-app/pokitch"
              target="_blank"
              rel="noreferrer"
            >
              Contribute!
            </Link>
          </p>
          <p>
            Contact:{" "}
            <Link className={linkClassName} href="mailto:pokitchbot@gmail.com">
              pokitchbot@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
