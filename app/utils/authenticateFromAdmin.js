//
import { apiVersion } from "../shopify.server";
import prisma from "../db.server";
import { shopifyApi } from "@shopify/shopify-api";

export async function authenticateFromAdmin(shop) {
  const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  shop = shop
    .toLowerCase()
    .replace(/^https:\/\//, "")
    .trim();

  const session = await prisma.session.findFirst({
    where: {
      shop,
    },
  });

  if (!session || !session.accessToken) {
    throw new Error("No valid session found for this shop");
  }

  try {
    const api = shopifyApi({
      apiKey: SHOPIFY_API_KEY,
      apiSecretKey: SHOPIFY_API_SECRET,
      scopes: [
        "write_products",
        "read_prodcuts",
        "read_orders",
        "write_orders",
        "read_customers",
        "write_customers",
      ],
      hostName: "soyas-ht.myshopify.com",
      apiVersion: apiVersion,
      isEmbeddedApp: true,
    });

    const admin = new api.clients.Graphql({
      session: {
        shop: session.shop,
        accessToken: session.accessToken,
        isOnline: false,
        scope: session.scope || "",
      },
      apiVersion: apiVersion,
    });

    return { admin, shop: session.shop };
  } catch (err) {
    console.error("Error creating admin GraphQL client:", err);
    throw err;
  }
}
