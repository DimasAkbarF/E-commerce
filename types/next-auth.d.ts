import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "user" | "admin";
      image?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
  }
}
