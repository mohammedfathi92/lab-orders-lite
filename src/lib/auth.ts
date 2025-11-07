import { NextAuthOptions } from "next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prismaRaw } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Please add it to your .env file."
  );
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error(
    "NEXTAUTH_URL is not set. Please add it to your .env file."
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaRaw) as unknown as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email (using raw client to bypass soft delete for auth)
        const user = await prismaRaw.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.deletedAt) {
          throw new Error("Invalid email or password");
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "ADMIN" | "USER" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: "ADMIN" | "USER" }).role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Get the server session using the configured auth options
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
