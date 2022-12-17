import Link from "next/link";
import { MdCatchingPokemon } from "react-icons/md";

export default function Header() {
  return (
    <header className="sticky top-0 bg-black/25 shadow-md backdrop-blur">
      <div className="container">
        <nav className="flex flex-row items-center py-4">
          <Brand />
        </nav>
      </div>
    </header>
  );
}

const Brand = () => {
  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center gap-x-1.5"
    >
      <MdCatchingPokemon className="h-6 w-6" />
      <span className="text-2xl font-extrabold">Pokitch</span>
    </Link>
  );
};
