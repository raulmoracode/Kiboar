import { fireEvent, render, screen } from "@testing-library/react-native";

import type { CatalogueItem } from "@/lib/catalogue";
import { ProductTile } from "./ProductTile";

const item: CatalogueItem = {
  variantId: "var_1",
  productId: "prod_1",
  title: "Kiboar 60% HHKB",
  unitAmount: 189,
  currency: "eur",
  thumbnail: null,
  soldOut: false,
};

describe("ProductTile", () => {
  it("adds an available product to the sale", async () => {
    const onAdd = jest.fn();
    await render(<ProductTile item={item} onAdd={onAdd} />);

    fireEvent.press(screen.getByRole("button", { name: "Add Kiboar 60% HHKB to cart" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows a sold-out product and refuses to add it", async () => {
    const onAdd = jest.fn();
    await render(<ProductTile item={{ ...item, soldOut: true }} onAdd={onAdd} />);

    expect(screen.getByText("Sold out")).toBeTruthy();
    expect(screen.queryByText("+")).toBeNull();

    const tile = screen.getByRole("button", { name: "Kiboar 60% HHKB is sold out" });
    fireEvent.press(tile);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
