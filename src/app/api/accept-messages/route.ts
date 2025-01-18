import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import connectdb from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(req: Request) {
  await connectdb();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user._id;
  const { acceptingMessages } = await req.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptingMessages,
      },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message:
            "Failed to update user status to accept messages in database request",
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        data: user,
      },
      { status: 500 }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  await connectdb();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  const acceptingMessages = user.isAcceptingMessages;
  return Response.json(
    {
      success: true,
      message: "accepting message status found",
      isAcceptingMessages: acceptingMessages,
    },
    { status: 200 }
  );
}
