import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import connectdb from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(
  req: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
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
  try {
    const updateResult = await UserModel.updateOne(
      {
        _id: user._id,
      },
      { $pull: { messages: { _id: messageId } } }
    );
    if (updateResult.modifiedCount == 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in deleting message");

    return Response.json(
      {
        success: false,
        message: "Error deleting message",
      },
      { status: 500 }
    );
  }
}
