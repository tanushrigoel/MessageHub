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
  const { acceptMessages } = await req.json();
  console.log("hi",acceptMessages);

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages,
      },
      { new: true }
    );
    console.log("updated",updatedUser);
    
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
      { status: 200 }
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
  let acceptingMessages = user.isAcceptingMessages;
  console.log(user);
  if (acceptingMessages == undefined) {
    user.isAcceptingMessages = true;
    
  }

  return Response.json(
    {
      success: true,
      message: "accepting message status found",
      isAcceptingMessages: acceptingMessages,
    },
    { status: 200 }
  );
}
