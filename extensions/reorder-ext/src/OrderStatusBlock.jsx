import {
  BlockStack,
  reactExtension,
  TextBlock,
  Button,
  useApi,
  Card,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order.action.menu-item.render",
  () => <PromotionBanner />,
);

function PromotionBanner() {
  const order = useApi("customer-account.order.action.menu-item.render");
  const ui = order.ui;
  const { sessionToken } = useApi();

  const orderID = order?.orderId;

  const reOrderProduct = async () => {
    console.log("Reordering for order ID:", orderID);

    try {
      const token = await sessionToken.get();
      const response = await fetch("https://demo71.iitpl.com/api/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ orderId: orderID }),
      });

      const data = await response.json();
      ui.toast.show("Reorderd successfuully");
      console.log("Reorder response:", data);
      console.log("success");
    } catch (error) {
      console.log("Error while Reordering", error);
      ui.toast.show("Failed");
    }
  };

  return <Button onPress={reOrderProduct}>Re-order</Button>;
}
