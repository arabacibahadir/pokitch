import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Link from "@/ui/Link";
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
      <div className="space-y-3">
        <Heading variant="h3">Welcome {data.channel}!</Heading>
        <p>
          Your Pokitch Overlay was successfully generated. Please{" "}
          <Link href="#how-to-use">click here</Link> to follow the instructions.
        </p>
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
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
      {showURL ? (
        <div
          className={
            "inline-flex select-all rounded-md bg-black bg-opacity-25 p-2 transition-display"
          }
        >
          <p>{url}</p>
        </div>
      ) : null}
      <p className="text-sm text-red-400">
        <span className="font-bold">Important!</span> In order to use the bot
        properly, you must assign it as a &quot;mod&quot; role:{" "}
        <span className="font-bold">/mod pokitch_bot</span>
      </p>
    </div>
  );
}
