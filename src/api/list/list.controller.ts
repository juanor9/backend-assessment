import { Request, Response } from "express";
import { createList } from "./list.services";
import { verifyToken } from "../../auth/auth.services";
import { getUserFilter, updateUserLists } from "../user/user.services";

export async function handleCreateList(req: Request, res: Response) {
  const data = req.body;
  try {
    // verify user token from header
    const userToken = req.headers?.authorization?.split(" ")[1] as string;
    const decoded = verifyToken(userToken);

    // get user by id from token
    if (typeof decoded !== "object") {
      return res.status(401).json({ message: "token is not valid" });
    }
    if (!decoded.hasOwnProperty("_id")) {
      return res.status(401).json({ message: "token is not valid" });
    }
    const userId = decoded._id;
    const user = await getUserFilter({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create List
    const list = await createList(data);

    // Add list to user's lists
    const listId = list._id;
    const updatedUser = await updateUserLists(userId, listId.toHexString());
    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json(error);
  }
}
