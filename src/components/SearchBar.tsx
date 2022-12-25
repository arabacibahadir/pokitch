import Input from "@/ui/Input";
import {useRouter} from "next/router";
import {useState} from "react";

type Props = {};

export default function SearchBar({}: Props) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchValue) return;
        router.push({
            pathname: "/collections",
            query: { user: searchValue }
        });
        setSearchValue("");
    };

  return (
    <div className="flex items-center justify-center ">
      <form className="w-full tablet:max-w-xs" onSubmit={handleSubmit}>
        <Input placeholder="Search for users..." value={searchValue ?? ""} onChange={(e)=>setSearchValue(e.target.value)}/>
      </form>
    </div>
  );
}
