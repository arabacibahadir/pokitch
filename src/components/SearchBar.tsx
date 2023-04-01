import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiRefreshCcw, FiX } from "react-icons/fi";

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
      query: { user: searchValue },
    });
  };

  const handleChannelSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue) return;
    router.push({
      pathname: "/collections",
      query: { channel: searchValue },
    });
  };

  const handleClearClick = () => {
    setSearchValue(null);
    router.push({
      pathname: "/collections",
    });
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative flex items-center ">
        <Button
          variant="transparent"
          className="mt-2 ml-2"
          onClick={() => setUserSearch(!userSearch)}
        >
          <span className={userSearch ? "underline" : ""}>{"User"}</span>
          <FiRefreshCcw className="mx-2" />
          <span className={!userSearch ? "underline" : ""}>{"Channel"}</span>
        </Button>

        {userSearch ? (
          <form
            className="w-full tablet:max-w-xs"
            onSubmit={handleUserSearchSubmit}
          >
            <Input
              placeholder="Search for users..."
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        ) : (
          <form
            className="w-full tablet:max-w-xs"
            onSubmit={handleChannelSearchSubmit}
          >
            <Input
              placeholder="Search for channels..."
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
        )}
        {searchValue && (
          <Button
            variant="transparent"
            className="left-0 mt-2 ml-2"
            onClick={handleClearClick}
          >
            <FiX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
