import connectdb from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(req: Request) {
  await connectdb();
  const { username, content } = await req.json();
  try {
    const user = await UserModel.findOne({ username });
    console.log("send message", user);
    
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        { status: 403 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages?.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("An unexpected error occurred: ", error);

    return Response.json(
      {
        success: false,
        message: "Message sending failed",
      },
      { status: 401 }
    );
  }
}
