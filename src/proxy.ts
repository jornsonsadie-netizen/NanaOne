import { auth } from "@/auth";
import { NextRequest } from "next/server";

export const proxy = auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
