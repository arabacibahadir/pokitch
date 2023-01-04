import Input from "@/ui/Input";
import {useRouter} from "next/router";
import {useState} from "react";
import {FiRefreshCcw} from "react-icons/fi";

type Props = {};

export default function SearchBar({}: Props) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState<string | null>(null);

    const [userSearch, setUserSearch] = useState<boolean | null>(true);

    const handleUserSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchValue) return;
        router.push({
            pathname: "/collections",
            query: { user: searchValue }
        });
        setSearchValue("");
    };
    const handleChannelSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchValue) return;
        router.push({
            pathname: "/collections",
            query: { channel: searchValue }
        });
        setSearchValue("");
    };

  return (
    <div className="flex items-center justify-center ">
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-neutral-900/25 hover:bg-neutral-900/50 m-3"
                onClick={()=>setUserSearch(!userSearch)}>
        User<FiRefreshCcw/>Channel
        </button>

        {userSearch ?<form className="w-full tablet:max-w-xs" onSubmit={handleUserSearchSubmit}>
        <Input placeholder= "Search for users..." value={searchValue ?? ""} onChange={(e)=>setSearchValue(e.target.value)}/>
      </form>:<form className="w-full tablet:max-w-xs" onSubmit={handleChannelSearchSubmit}>
            <Input placeholder= "Search for channels..." value={searchValue ?? ""} onChange={(e)=>setSearchValue(e.target.value)}/>
        </form> }
    </div>
  );
}
