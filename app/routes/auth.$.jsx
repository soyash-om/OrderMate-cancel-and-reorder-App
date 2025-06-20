// In your installation route (e.g., app/routes/auth/callback.tsx)
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // Store the session data in your database
  await prisma.shopSession.create({
    data: {
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scopes.toString(),
      // Add any other relevant fields
    },
    update: {
      accessToken: session.accessToken,
      scope: session.scopes.toString(),
      // Update other fields if they exist
    },
    where: {
      shop: session.shop,
    },
  });

  return redirect(`/app?shop=${session.shop}`);
};
