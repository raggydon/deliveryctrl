// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: "ADMIN" | "DRIVER";
        };
    }

    interface User {
        id: string;
        role: "ADMIN" | "DRIVER";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "DRIVER";
    }
}