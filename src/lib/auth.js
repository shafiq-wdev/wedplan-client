import { betterAuth } from "better-auth";
import {
  APIError,
  addOAuthServerContext,
  createAuthMiddleware,
  getOAuthState,
} from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { db, mongoClient } from "./db.js";
import { SIGNUP_ROLES } from "./roles.js";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

const PASSWORD_MESSAGE =
  "Password must be at least 6 characters and include one uppercase and one lowercase letter.";

function sanitizeRole(role) {
  return SIGNUP_ROLES.includes(role) ? role : "customer";
}

function assertAdminCode(code) {
  const requiredCode = process.env.ADMIN_SIGNUP_CODE;

  // Open in demo mode; set ADMIN_SIGNUP_CODE to lock admin sign-up down.
  if (!requiredCode) return;

  if (typeof code !== "string" || code !== requiredCode) {
    throw new APIError("FORBIDDEN", {
      message: "Invalid admin access code.",
    });
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const oauthState = await getOAuthState();
          const requestedRole =
            oauthState?.serverContext?.signupRole ?? ctx?.body?.role;

          return {
            data: {
              ...user,
              role: sanitizeRole(requestedRole),
            },
          };
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const password = ctx.body?.password;

        if (typeof password === "string" && !PASSWORD_PATTERN.test(password)) {
          throw new APIError("BAD_REQUEST", { message: PASSWORD_MESSAGE });
        }

        if (ctx.body?.role === "admin") {
          assertAdminCode(ctx.body?.adminCode);
        }
      }

      if (ctx.path === "/sign-in/social") {
        const role = sanitizeRole(ctx.body?.additionalData?.role);

        if (role === "admin") {
          assertAdminCode(ctx.body?.additionalData?.adminCode);
        }

        // Keep the selected role in server-trusted OAuth state so it survives
        // the provider redirect and cannot be swapped on the callback.
        await addOAuthServerContext({ signupRole: role });
      }
    }),
  },
});
