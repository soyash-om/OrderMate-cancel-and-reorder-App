import { cancelOrderHelper } from "../HelperApi/cancelOrderHelper";
import { json } from "@remix-run/node";
import jwt from "jsonwebtoken";
import { authenticateFromAdmin } from "../utils/authenticateFromAdmin";

export const loader = async ({ request }) => {
  console.log("start- cancel--------------------");

  if (request.method === "OPTIONS") {
    console.log("your request goes as options");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  return new Response("Method Not Alloweds", { status: 405 });
};

export const action = async ({ request }) => {
  console.log("came inside cancel order");
  const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

  try {
    const authHeader = request.headers.get("Authorization");
    console.log("check token for auth", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("token inside cancelorder", token);
    const payload = jwt.verify(token, SHOPIFY_API_SECRET, {
      algorithms: ["HS256"],
    });

    const shopDomain = payload.dest.replace(/^https:\/\//, "");

    const { admin } = await authenticateFromAdmin(shopDomain);
    if (!admin) {
      console.log("Request not authenticate From Admin");
      return json({ error: "Admin session not found" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, cancelreason } = body;
    if (!orderId || !cancelreason) {
      return json(
        { error: "Missing orderId or cancelReason" },
        { status: 400 },
      );
    }

    const cancelOrderResult = await cancelOrderHelper(
      admin,
      orderId,
      cancelreason,
    );
    console.log("end cancel---------------------");
    return json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type Authorization",
        },
      },
    );
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
