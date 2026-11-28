import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

import { CartProvider, useCart } from "./cart-context";

function Probe() {
  const cart = useCart();

  return (
    <>
      <Pressable accessibilityLabel="open-cart" accessibilityRole="button" onPress={cart.openCart}>
        <Text>{cart.isOpen ? "open" : "closed"}</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="close-cart"
        accessibilityRole="button"
        onPress={cart.closeCart}
      >
        <Text>close</Text>
      </Pressable>
    </>
  );
}

describe("the cart panel state", () => {
  it("opens and closes", async () => {
    await render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );

    expect(screen.getByText("closed")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("open-cart"));
    await waitFor(() => expect(screen.getByText("open")).toBeTruthy());

    fireEvent.press(screen.getByLabelText("close-cart"));
    await waitFor(() => expect(screen.getByText("closed")).toBeTruthy());
  });
});
