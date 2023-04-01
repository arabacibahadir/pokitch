import { cx } from "class-variance-authority";
import Link from "next/link";
import { MdCatchingPokemon } from "react-icons/md";

const menuItems = [
  {
    name: "Collections",
    path: "/collections",
    isDisabled: false,
  },
  {
    name: "Gift",
    path: "/gift",
    isDisabled: false,
  },
  {
    name: "Trade",
    path: "/trade",
    isDisabled: false,
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 bg-black/25 shadow-md backdrop-blur">
      <div className="container">
        <div className="flex flex-row items-center justify-between py-4">
          <Brand />

          <nav className="inline-flex items-center justify-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cx("text-base font-semibold", [
                  item.isDisabled ? "cursor-not-allowed opacity-60" : "",
                ])}
              >
                {item.name}
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
