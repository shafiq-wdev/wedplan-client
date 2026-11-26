import { betterAuth } from "better-auth";
import {
  APIError,
  addOAuthServerContext,
  createAuthMiddleware,
  getOAuthState,
} from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { PUBLIC_ROLES } from "./roles.js";

const globalForMongo = globalThis;

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

const PASSWORD_MESSAGE =
  "Password must be at least 6 characters and include one uppercase and one lowercase letter.";

function sanitizeRole(role) {
  return PUBLIC_ROLES.includes(role) ? role : "customer";
}

function getMongoConnection() {
  const uri = process.env.BETTER_AUTH_DB_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("BETTER_AUTH_DB_URI is not set");
  }

  const client = new MongoClient(uri);

  return {
    client,
    db: client.db(process.env.BETTER_AUTH_DB_NAME || "wedplandb"),
  };
}

const mongo = globalForMongo.__wedplanMongo ?? getMongoConnection();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__wedplanMongo = mongo;
}

const { client, db } = mongo;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client,
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
            oauthState?.serverContext?.signupRole ??
            ctx?.body?.role;

          // Admin accounts are provisioned outside public registration.
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
      }

      if (ctx.path === "/sign-in/social") {
        // Keep the selected role in server-trusted OAuth state so it survives
        // the provider redirect and cannot be swapped on the callback.
        await addOAuthServerContext({
          signupRole: sanitizeRole(ctx.body?.additionalData?.role),
        });
      }
    }),
  },
});
