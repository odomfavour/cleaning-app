import { env } from "../server/config/env";

console.log("Server environment is valid.");
console.log({
  appUrl: env.APP_URL,
  hasMongoDbUri: Boolean(env.MONGODB_URI),
  hasSessionSecret: Boolean(env.SESSION_SECRET),
  hasPaystackSecretKey: Boolean(env.PAYSTACK_SECRET_KEY),
  hasPaystackPublicKey: Boolean(env.PAYSTACK_PUBLIC_KEY),
});
