import { supabase } from "@/utils/supabase";
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
    const twitchId = userDetails.data[0].id as string;
    const loginName = userDetails.data[0].login as string;

    // get user from db
    const { data: user } = await supabase
      .from("accounts")
      .select()
      .eq("twitch_id", twitchId)
      .single();
    if (!user) {
      const { data: account } = await supabase
        .from("accounts")
        .insert({ twitch_id: twitchId, channel: loginName })
        .select()
        .single();

      //return res.status(200).json(account);
      return res.redirect(307, "/?id=" + account.id);
    }

    //res.status(200).json(user);
    return res.redirect(307, "/?id=" + user.id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}
