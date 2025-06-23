import React, { useState } from "react";
import {
  BlockStack,
  reactExtension,
  TextBlock,
  Card,
  Grid,
  Button,
  ChoiceList,
  Select,
  Divider,
  useOrder,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.customer-information.render-after",
  () => <OrderCancelActionStatus />,
);

function OrderCancelActionStatus() {
  const order = useOrder();
  const apiObj = useApi();
  const ui = apiObj.ui;

  const cancelledAt = order?.cancelledAt;
  const orderId = order?.id;

  const { sessionToken } = useApi();
  console.log("session token new ", sessionToken);

  const [clickToCancel, setclickToCancel] = useState(false);
  const [selectReason, setSelectReason] = useState("CUSTOMER");

  const reasonSelectfunction = (newValue) => {
    console.log("newvalue  --- ", newValue);
    setSelectReason(newValue);
  };

  const cancelWithReason = async () => {
    console.log(
      "cancelWithReason called with orderId:",
      orderId,
      "and reason:",
      selectReason,
    );
    try {
      const token = await sessionToken.get();
      console.log("token", token);
      const sendReq = await fetch(
        "https://demo71.iitpl.com/api/cancelorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderId,
            cancelreason: selectReason,
          }),
          credentials: "include",
        },
      );

      const res = await sendReq.json();
      ui.toast.show("order canceled please refresh the page ");

      if (res.success) {
        // ui.toast.show("Request sent successfully");
        console.log("success");
      } else {
        console.log("fails");
      }
    } catch (error) {
      console.log("error is ", error);
      ui.toast.show("Request failed");
    }
  };
  return (
    <Card padding>
      <Grid
        columns={["fill", "auto"]}
        spacing="base"
        minInlineSize="fill"
        blockAlignment="start"
      >
        <BlockStack inlineAlignment="center">
          <TextBlock>Order Action</TextBlock>
          {cancelledAt ? (
            <TextBlock>Order is already canceled</TextBlock>
          ) : (
            <Button
              onPress={() => {
                setclickToCancel(true);
                // ui.toast.show("show  all");
              }}
            >
              Order Cancel
            </Button>
          )}
        </BlockStack>
      </Grid>

      {clickToCancel && !cancelledAt && (
        <BlockStack>
          <Divider />

          <ChoiceList>
            <TextBlock>Are youyou want to cancel the order ?</TextBlock>
            <Select
              padding
              value={selectReason}
              onChange={reasonSelectfunction}
              options={[
                {
                  label: "CUSTOMER_REQUEST",
                  value: "CUSTOMER",
                },
                {
                  label: "DEFECTIVE_PRODUCT",
                  value: "FRAUD",
                },
                {
                  label: "Other",
                  value: "OTHER",
                },
              ]}
            />
            <BlockStack inlineAlignment="center">
              <Button onPress={cancelWithReason}>Confirm Cancel</Button>
            </BlockStack>
          </ChoiceList>
        </BlockStack>
      )}
    </Card>
  );
}
