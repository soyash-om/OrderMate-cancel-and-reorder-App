export const getOrderInformation = async (admin, orderId) => {
  console.log("order id in api reorder", orderId);

  try {
    const query = `
      query {
        order(id: "${orderId}") {
          billingAddress {
            address1
            city
          }
          confirmed
          createdAt
          customer {
            addresses(first: 1) {
              id
              address1
              firstName
              lastName
              zip
              country
              city
              province
            }
            email
          }
          lineItems(first: 1) {
            edges {
              node {
                name
                product {
                  id
                  variants(first: 2) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`;
    console.log("query", query);
    const response = await admin.client.request(query);
    console.log("response on order data get", response);

    return response.data;
  } catch (error) {
    console.error("Failed to fetch order information:", error);
    throw error;
  }
};
