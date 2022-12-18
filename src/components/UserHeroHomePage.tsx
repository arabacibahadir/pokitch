import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Link from "@/components/ui/Link";
import { cx } from "class-variance-authority";
import { useState } from "react";
import { BiShow } from "react-icons/bi";
import { FaClipboardCheck } from "react-icons/fa";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const copyURL = (id: string) => {
  navigator.clipboard.writeText(`${getBaseUrl()}/overlays/${id}`);
  return alert("The URL has been copied!");
};

export default function GuestHeroHomePage({ data }: { data: any }) {
  const [showURL, setShowURL] = useState(false);
  const url = getBaseUrl() + `/overlays/${data.id}`;

  return (
    <div className="space-y-3 rounded-md bg-green-400/25 p-6 shadow">
      <Heading variant="h3">Welcome {data.channel}!</Heading>
      <p>
        Your Pokitch Overlay was successfully generated. Please{" "}
        <Link href="#how-to-use">click here</Link> to follow the instructions.
      </p>
      <div className="inline-flex flex-row gap-2">
        <Button
          variant="success"
          startIcon={<FaClipboardCheck />}
          onClick={() => copyURL(data.id)}
        >
          Copy URL
        </Button>
        <Button
          variant="success"
          startIcon={<BiShow />}
          onClick={() => setShowURL(!showURL)}
        >
          Show URL
        </Button>
      </div>
      <div
        className={cx(
          "inline-flex select-all rounded-md bg-black bg-opacity-25 p-2 transition-display",
          showURL ? "block" : "hidden"
        )}
      >
        <p onClick={() => copyURL(data.id)}>{url}</p>
      </div>
    </div>
  );
}
