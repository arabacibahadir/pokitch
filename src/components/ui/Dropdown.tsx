import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";

const dropdownMenuStyles = cva(
  "absolute w-40 py-2 mt-1 bg-amber-800 rounded-md shadow-lg z-10  max-h-80 overflow-y-auto overflow-x-hidden"
);

const dropdownMenuLinkStyles = cva(
  "block w-full px-1 py-1 text-sm text-gray-100 hover:bg-amber-700 "
);

const toggleButtonStyles = cva(
  "inline-flex justify-center w-full rounded-md border border-yellow-300 shadow-sm px-6 py-2 bg-amber-900 text-sm font-medium hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-100 focus:ring-yellow-500",
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-4 py-2 text-base",
      },
      variant: {
        primary: "bg-yellow-600 hover:bg-yellow-700 text-yellow-50",
        twitch: "bg-purple-700 hover:bg-purple-800 text-purple-50",
        success: "bg-green-600 hover:bg-green-700 text-green-50",
        transparent: "bg-neutral-900/25 hover:bg-neutral-900/50",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

export interface DropdownProps {
  label: string;
  menuItems: { label: string; onClick: () => void }[];
}

export default function Dropdown({ label, menuItems }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className={toggleButtonStyles({})}
        onClick={handleButtonClick}
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-3 h-5 w-5 ${
            isOpen ? "-rotate-180" : "rotate-0"
          } transition-transform duration-150 ease-in-out`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M6 8l4 4 4-4h-8z" />
        </svg>
      </button>
      {isOpen && (
        <div className={dropdownMenuStyles()}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={dropdownMenuLinkStyles()}
              onClick={() => {
                handleMenuItemClick(item.onClick);
              }}
              onChange={handleButtonClick}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
