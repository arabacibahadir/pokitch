import supabase from "@/utils/supabase";
import { twitch } from "@/utils/twitch";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  try {
    // get access token from twitch
    const token = await twitch.getAccessToken(code);
    if (!token) {
      return res.status(400).json({
        message: "bad request of token",
      });
    }

    // get user from twitch
    const userDetails = await twitch.getUserDetails(token.access_token);
    if (!userDetails?.data.length) {
      return res.status(400).json({
        message: "bad request of user",
      });
    }
    const userEmail = userDetails.data[0].email as string;

    // get user from db
    const { data: user } = await supabase
      .from("accounts")
      .select()
      .eq("email", userEmail)
      .single();
    if (!user) {
      const { data: account, error } = await supabase
        .from("accounts")
        .insert({ email: userEmail })
        .select();
      console.log(error);

      return res.status(200).json(account);
      // return res.redirect(307, "/")
    }

    res.status(200).json(user);
    //// return res.redirect(307, "/")
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}
