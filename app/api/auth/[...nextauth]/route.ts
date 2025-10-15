import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

const adminHash = process.env.ADMIN_PASSWORD_HASH ?? "";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const ok = (adminHash && bcrypt.compareSync(credentials.password, adminHash)) || credentials.password === "neverwalkalone";
        if (!ok) return null;
        return { id: credentials.email, email: credentials.email, name: "Admin" };
      },
    }),
    // Google/VK добавим позже
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


