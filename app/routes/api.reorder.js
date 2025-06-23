import { json } from "@remix-run/node";
import jwt from "jsonwebtoken";

import { authenticateFromAdmin } from "../utils/authenticateFromAdmin";
import { getOrderInformation } from "../HelperApi/getOrderInformation";
import { reorderHelper } from "../HelperApi/reorderHelper";

export const loader = async ({ request }) => {
  console.log("start reorder---------------------");
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  return new Response("Method Not Allowed", { status: 405 });
};

export const action = async ({ request }) => {
  console.log("getting");
  try {
    const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
    const authHeader = request.headers.get("Authorization");
    console.log("case token check --->", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("case token-->", token)
    const payload = jwt.verify(token, SHOPIFY_API_SECRET, {
      algorithms: ["HS256"],
    });

    const shopDomain = payload.dest.replace(/^https:\/\//, "");
    const { admin } = await authenticateFromAdmin(shopDomain);

    if (!admin) {
      return json({ error: "Admin session not found" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return json({ error: "Missing orderId" }, { status: 400 });
    }

    const orderData = await getOrderInformation(admin, orderId);

    const placeNewOrder = await reorderHelper(admin, orderData);

    console.log("reorder end-----------------");

    return json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    console.error("Reorder Error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
