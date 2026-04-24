import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

// Mock user database
const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@foodstore.com",
    role: "admin",
  },
  {
    id: "2",
    name: "John Doe",
    email: "user@example.com",
    role: "user",
  },
];

// Mock passwords (in production, use hashed passwords)
const passwords: Record<string, string> = {
  "admin@foodstore.com": "admin123",
  "user@example.com": "user123",
};

// Use a consistent secret for JWT
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "foodstore-secret-key-2024";

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((u) => u.email === credentials.email);
        
        if (!user) {
          return null;
        }

        const validPassword = passwords[credentials.email] === credentials.password;
        
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || "user"; // Default to user if no role
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") || "user";
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
