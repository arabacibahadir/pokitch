import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Link from "@/components/ui/Link";
import { FaClipboardCheck } from "react-icons/fa";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default function GuestHeroHomePage({ data }: { data: any }) {
  return (
    <div className="space-y-3 rounded-md bg-green-400/25 p-6 shadow">
      <Heading variant="h3">Welcome {data.channel}!</Heading>
      <p>
        Your Pokitch Overlay was successfully generated. Please{" "}
        <Link href="#how-to-use">click here</Link> to follow the instructions.
      </p>
      <Button
        variant="success"
        startIcon={<FaClipboardCheck />}
        onClick={() => {
          navigator.clipboard.writeText(`${getBaseUrl()}/overlays/${data.id}`);
          return alert("The URL has been copied!");
        }}
      >
        Click and Copy to Overlay URL
      </Button>
    </div>
  );
}
