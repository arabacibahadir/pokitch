import { prisma } from "@/utils/prisma";
import { twitch } from "@/utils/twitch";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  try {
    // get access token from twitch
    const getToken = await twitch.getAccessToken(code);
    if (!getToken) {
      return res.status(400).json({
        message: "bad request of token",
      });
    }

    // get user from twitch
    const getUserFromTwitch = await twitch.getUserDetails(
      getToken.access_token
    );
    const userEmail = getUserFromTwitch?.data[0].email as string;
    if (!userEmail) {
      return res.status(400).json({
        message: "bad request of user",
      });
    }

    // get user from db
    const getUserFromDB = await prisma.account.findUnique({
      where: { email: userEmail },
    });
    if (!getUserFromDB) {
      const createAccount = await prisma.account.create({
        data: {
          email: userEmail,
        },
      });

      return res.status(200).json(createAccount);
      // return res.redirect(307, "/")
    }

    res.status(200).json(getUserFromDB);
    //// return res.redirect(307, "/")
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}
