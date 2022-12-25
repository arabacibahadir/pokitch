import { cx } from "class-variance-authority";
import React from "react";

type Props = React.ComponentProps<"input">;

export default function Input({ ...props }: Props) {
  return (
    <input
      className={cx(
        "block w-full rounded-lg border border-neutral-800 bg-neutral-900/50 p-2.5 text-sm text-white placeholder-gray-400 focus:outline-none"
      )}
      {...props}
    />
  );
}
