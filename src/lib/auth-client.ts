import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
// import { ac, admin, influencer, business } from "@/lib/permission";

import type { auth } from "./auth";
export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    //   {
    //   ac,
    //   roles: {
    //     admin,
    //     influencer,
    //     business,
    //   },
    //   defaultRole: "influencer",
    // }
    passkeyClient(), // Add the Passkey plugin
    inferAdditionalFields<typeof auth>(), // Infer additional fields from the server-side auth configuration
  ],
});

// Export the auth client methods
export const { signIn, signUp, signOut, useSession } = authClient;
