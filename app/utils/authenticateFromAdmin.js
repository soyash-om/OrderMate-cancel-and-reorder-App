//
import shopify, { apiVersion } from "../shopify.server";
import { ApiVersion } from "@shopify/shopify-api";
// import { GraphqlClient } from '@shopify/shopify-api';
// import { shopifyApi } from '@shopify/shopify-api';
import prisma from "../db.server";
import {
  shopifyApi,
  LATEST_API_VERSION,
  GraphqlClient,
} from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-remix/server";

export async function authenticateFromAdmin(shop) {

  const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;
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
