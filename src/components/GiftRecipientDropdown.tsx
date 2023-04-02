import Dropdown from "@/ui/Dropdown";
import { useState } from "react";
type GiftRecipientDropdownProps = {
  user: any;
  onChange: (selectedUser: string) => void;
};

export default function GiftRecipientDropdown({
  user,
  onChange,
}: GiftRecipientDropdownProps) {
  const [giftRecipient, setGiftRecipient] = useState("");

  const uniqueUserNames = new Set(
    user.otherUserNames.map((userName: any) => userName.user)
  );

  const listItem = (userName: any) => {
    return {
      label: userName,
      onClick: () => {
        setGiftRecipient(userName);
        onChange(userName);
      },
    };
  };
  const menuItems = Array.from(uniqueUserNames)
    .sort((a: any, b: any) => a.localeCompare(b))
    .map(listItem);

  const label = giftRecipient ? giftRecipient : "Select user";

  return (
    <>
      {user.otherUserNames && (
        <div>
          <p>Trade with</p>
          <Dropdown label={label} menuItems={menuItems} />
        </div>
      )}
    </>
  );
}
