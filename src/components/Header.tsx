import Link from "next/link";
import { MdCatchingPokemon } from "react-icons/md";

const menuItems = ["Inventory", "Trade"];

export default function Header() {
  return (
    <header className="sticky top-0 bg-black/25 shadow-md backdrop-blur">
      <div className="container">
        <div className="flex flex-row items-center justify-between py-4">
          <Brand />

          <nav className="inline-flex items-center justify-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item}
                href="/"
                className="cursor-not-allowed text-base font-semibold opacity-60"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
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
