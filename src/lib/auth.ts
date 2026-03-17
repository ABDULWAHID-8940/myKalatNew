import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "./email-service";
// import { passkey } from "better-auth/plugins/passkey";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { admin as adminPlugin } from "better-auth/plugins";
// import { ac, admin, influencer, business } from "@/lib/permission";

await dbConnect();

const db = mongoose.connection.db;

if (!db) {
  throw new Error("Database connection is not established.");
}

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://172.22.84.96:3000",
    "http://172.22.85.157:3000",
      "https://*.vercel.app",
    "https://www.mykalat.com",
    "https://promolink-git-feature-chat-fikiryilkal-tages-projects.vercel.app",
    "https://promolink-git-feature-business-fikiryilkal-tages-projects.vercel.app",
    "https://promolink-kgdf93dee-fikiryilkal-tages-projects.vercel.app",
    "https://promolink-git-feature-branch-fikiryilkal-tages-projects.vercel.app",
  ],
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "influencer",
      },
      coverImage: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
        defaultValue: "Tecno",
      },
      socialMedia: {
        type: "string", // Store as a JSON string
        required: false,
        defaultValue: JSON.stringify([]), // Default is an empty array as a string
      },
      verified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      rating: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      totalEarnings: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: " ",
      },
      price: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      companyName: {
        type: "string",
        required: false, // Not strictly required since we can't do conditional logic
      },
      goals: {
        type: "string[]",
        required: false,
        defaultValue: [],
      },
      industry: {
        type: "string",
        required: false,
      },
      businessPhone: {
        type: "string",
        required: false,
        pattern: "^\\+?[0-9\\s-]{10,}$",
      },
      businessSize: {
        type: "string",
        required: false,
        enum: ["startup", "small", "medium", "large"],
      },
      businessVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      onboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      savedJobs: { type: "string[]", required: false, defaultValue: [] },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `Click the link to verify your email: ${url}`,
      });
    },
  },

  plugins: [
    // passkey(),
    adminPlugin(),
    //   {
    //   ac,
    //   roles: {
    //     admin,
    //     influencer,
    //     business,
    //   },
    // }
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => ({
          data: {
            ...user,
            role: ctx?.body.role || "influencer",
          },
        }),
      },
    },
  },
});