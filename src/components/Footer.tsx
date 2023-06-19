import Link from "@/ui/Link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-black py-6">
      <div className="container">
        <div className="text-center">
          <p>
            <Link href="/">Pokitch</Link> is an open-source initiative.{" "}
            <Link
              href="https://github.com/pokitch-app/pokitch"
              target="_blank"
              rel="noreferrer"
            >
              Contribute!
            </Link>
          </p>
          <p className="text-sm">
            Contact:{" "}
            <Link href="mailto:pokitchbot@gmail.com">pokitchbot@gmail.com</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
