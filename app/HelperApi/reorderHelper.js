export const reorderHelper = async (admin, orderData) => {
  console.log("case came --->", orderData);
  try {
    const mutation = `mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        userErrors {
          field
          message
        }
        order {
          id
          billingAddress {
            address1
            city
            country
            firstName
            lastName
            id
          }
          createdAt
          confirmed
          customer {
            id
            email
          }
          lineItems(first: 5) {
            nodes {
              variant {
                id
              }
              id
              title
              quantity
              taxLines {
                title
                rate
                priceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }`;
    const response = await admin.client.request(mutation, {
      variables: {
        order: {
          email: orderData.order.customer.email,
          financialStatus: "PENDING",
          billingAddress: {
            address1: orderData.order.billingAddress.address1,
            city: orderData.order.billingAddress.city,
            country: orderData.order.customer.addresses[0].country,
            firstName: orderData.order.customer.addresses[0].firstName,
            lastName: orderData.order.customer.addresses[0].lastName,
            zip: orderData.order.customer.addresses[0].zip,
          },
          lineItems: [
            {
              variantId:
                orderData.order.lineItems.edges[0].node.product.variants
                  .edges[0].node.id,
              quantity: 1,
            },
          ],
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to create/reorder order:", error);
    throw error;
  }
};
