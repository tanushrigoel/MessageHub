import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectdb from "@/lib/dbConnect";
import UserModel from "@/model/User";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any, req): Promise<any> {
//         await connectdb();
//         console.log(credentials);

//         try {
//           const user = await UserModel.findOne({
//             $or: [
//               { email: credentials.identifier },
//               { username: credentials.identifier },
//             ],
//           });
//           if (!user) {
//             throw new Error("No such user exist");
//           }
//           if (!user.isVerified) {
//             throw new Error("Please verify your account first");
//           }
//           console.log(user);

//           const isPasswordCorrect = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (isPasswordCorrect) {
//             return user;
//           } else {
//             throw new Error("Enter correct password");
//           }
//         } catch (err: any) {
//           throw new Error(err);
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       // console.log(user.isAcceptingMessages);

//       if (user) {
//         token._id = user._id?.toString();
//         token.isVerified = user.isVerified;
//         token.isAcceptingMessages = user.isAcceptingMessages;
//         token.username = user.username;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user._id = token._id;
//         session.user.isVerified = token.isVerified;
//         session.user.isAcceptingMessages = token.isAcceptingMessages;
//         session.user.username = token.username;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/sign-in",
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req): Promise<any> {
        await connectdb();
        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });

        if (!user) throw new Error("No such user exist");
        if (!user.isVerified)
          throw new Error("Please verify your account first");

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Enter correct password");

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV,
        path: "/",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
