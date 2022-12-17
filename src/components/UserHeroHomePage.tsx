import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { FaClipboardCheck } from "react-icons/fa";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default function GuestHeroHomePage({ data }: { data: any }) {
  return (
    <div className="space-y-2">
      <Heading>Welcome {data.channel}!</Heading>
      <p>{`${getBaseUrl()}/overlays/${data.id}`}</p>
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
