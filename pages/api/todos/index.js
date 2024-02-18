import { verifyToken } from "@/utils/auth";
import UserModel from "@/models/User";
import TodoModel from "@/models/Todo";
import connectToDB from "@/configs/db";

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

  const user = await UserModel.findOne({
    email: tokenPayload.email,
  });

  if (req.method === "GET") {
    const allTodo = await TodoModel.find({ user: user._id });
    return res.status(200).json({
      message: "OK",
      data: allTodo,
    });
  } else if (req.method === "POST") {
    const { title, isCompleted } = JSON.parse(req.body);
    const newTodo = {
      title,
      isCompleted,
      user: user._id,
    };

    await TodoModel.create(newTodo);

    return res.status(201).json({ message: "Created Successfully" });
  } else {
    return false;
  }
};

export default handler;
