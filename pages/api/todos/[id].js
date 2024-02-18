import UserModel from "@/models/User";
import TodoModel from "@/models/Todo";
import { isValidObjectId } from "mongoose";
import connectToDB from "@/configs/db";
import { verifyToken } from "@/utils/auth";

const handler = async (req, res) => {
  connectToDB();

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "You are not login !!" });
  }

  const tokenPayload = verifyToken(token);

  if (!tokenPayload) {
    return res.status(401).json({ message: "You are not login !!" });
  }

  const user = await UserModel.find({ email: tokenPayload.email });

  if (!user) {
    return res.status(404).json({ message: "User Not Found!!" });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    const idValidation = isValidObjectId(id);

    if (idValidation) {
      try {
        const removeTodo = await TodoModel.findOneAndDelete({ _id: id });
        return res.status(200).json({ message: "Deleted Successfully" });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "UnKnown Internal Server Erorr !!" });
      }
    } else {
      return res.status(404).json("Todo Not Found!!!");
    }
  }
};

export default handler;
