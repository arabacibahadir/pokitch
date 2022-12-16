import { prisma } from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  try {
    // check user from db
    const getUser = await prisma.account.findUnique({ where: { id: id } });
    if (!getUser) {
      return res.status(400).json({ message: `user not exist with id ${id}` });
    }

    res.status(200).json(getUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}
