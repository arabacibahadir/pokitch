import { Alert, AlertDescription } from "@/components/ui/alert";

import { initialTransferState } from "./types";

export function TransferActionMessage({
  state,
}: {
  state: typeof initialTransferState;
}) {
  if (state.status === "idle") return null;

  return (
    <Alert variant={state.status === "error" ? "destructive" : "success"}>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
