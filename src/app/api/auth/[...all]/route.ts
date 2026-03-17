import { auth } from "@/lib/auth"; 
import { toNextJsHandler } from "better-auth/next-js";

// Add these two lines:
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const { POST, GET } = toNextJsHandler(auth);