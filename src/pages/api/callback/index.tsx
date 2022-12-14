import { twitch } from "@/utils/twitch";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  try {
    const getToken = await twitch.getAccessToken(code);
    if (!getToken) {
      return res.status(400).json({
        message: "bad request of token",
      });
    }

    const getUser = await twitch.getUserDetails(getToken.access_token);
    if (!getUser) {
      return res.status(400).json({
        message: "bad request of user",
      });
    }

    res.status(200).json(getUser);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
}
