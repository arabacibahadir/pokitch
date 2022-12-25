import Input from "@/ui/Input";

type Props = {};

export default function SearchBar({}: Props) {
  return (
    <div className="flex items-center justify-center ">
      <form className="w-full tablet:max-w-xs">
        <Input placeholder="Search for users..." />
      </form>
    </div>
  );
}
