import { json } from "@remix-run/node";
export const cancelOrderHelper = async (admin, orderId, cancelreason) => {
  
  try {
    const query = `
         mutation orderCancel($notifyCustomer: Boolean, $orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!, $staffNote: String) {
orderCancel(notifyCustomer: $notifyCustomer, orderId: $orderId, reason: $reason, refund: $refund, restock: $restock, staffNote: $staffNote) {
 job {
 id
 }
 orderCancelUserErrors {
  field
  message
 }
 userErrors {
   field
   message
 }
}
}
        `;

    const response = await admin.client.request(query, {
      variables: {
        notifyCustomer: false,
        orderId: orderId,
        reason: cancelreason,
        refund: true,
        restock: true,
        staffNote: "",
      },
    });

  

    return json({ success: true });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
};
