export type CollectionOption = {
  id: string;
  poke: string;
  user: string;
  channel: string;
};

export type CollectorOption = {
  twitchId: string;
  username: string;
};

export type TradeRow = {
  id: string;
  user: string;
  poke: string;
  pokeid: string;
  recipient: string;
  recipientpoke: string;
  recipientpokeid: string;
  created_at: string;
};

export type TransferActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialTransferState: TransferActionState = {
  status: "idle",
  message: "",
};
