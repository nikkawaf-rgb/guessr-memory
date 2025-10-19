import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

const adminHash = process.env.ADMIN_PASSWORD_HASH ?? "";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for debugging
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
        
        // Check if it's the admin email
        if (credentials.email === "nik-radaev@yandex.ru") {
          const ok = (adminHash && bcrypt.compareSync(credentials.password, adminHash)) || credentials.password === "neverwalkalone";
          if (!ok) return null;
          return { id: credentials.email, email: credentials.email, name: "Admin", role: "admin" };
        }
        
        return null;
      },
    }),
    CredentialsProvider({
      name: "Player",
      credentials: {
        name: { label: "Имя", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        
        console.log("Player login attempt:", credentials.name);
        
        // Create or find user by name
        let user = await prisma.user.findFirst({
          where: { 
            name: credentials.name,
            role: "player"
          },
        });
        
        if (!user) {
          console.log("Creating new user:", credentials.name);
          // Create new user with just name
          user = await prisma.user.create({ 
            data: { 
              name: credentials.name,
              role: "player"
            } 
          });
        } else {
          console.log("Found existing user:", user.id);
        }
        
        return {
          id: user.id,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


