import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    async jwt({ token, user, account }) {
      console.log("JWT callback - user:", user);
      console.log("JWT callback - token:", token);
      console.log("JWT callback - account:", account);
      
      // On first sign in, user object is available
      if (user && 'role' in user) {
        token.role = user.role;
        console.log("Setting token role from user:", user.role);
      }
      
      // On subsequent requests, check if role exists in token
      if (!token.role && token.sub) {
        console.log("Token missing role, fetching from database for:", token.sub);
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          console.log("Setting token role from database:", dbUser.role);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token);
      console.log("Session callback - session:", session);
      
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        console.log("Setting session role:", token.role);
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


