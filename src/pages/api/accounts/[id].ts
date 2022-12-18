import { supabase } from "@/utils/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  try {
    // get user from db
    const { data: user } = await supabase
      .from("accounts")
      .select()
      .eq("id", id)
      .single();
    if (!user) {
      return res.status(404).json({ message: `user not exist with id ${id}` });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}
