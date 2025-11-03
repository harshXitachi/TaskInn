import paypal from "@paypal/paypal-server-sdk";

const client = paypal.core.PayPalHttpClientFactory.fromEnvironment(
  process.env.PAYPAL_MODE === "live"
    ? paypal.core.LiveEnvironmentFactory.fromClientCredentials({
        clientId: process.env.PAYPAL_CLIENT_ID!,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      })
    : paypal.core.SandboxEnvironmentFactory.fromClientCredentials({
        clientId: process.env.PAYPAL_CLIENT_ID!,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      })
);

export default client;
