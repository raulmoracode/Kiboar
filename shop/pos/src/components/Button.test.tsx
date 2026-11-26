import { fireEvent, render, screen } from "@testing-library/react-native";

import { Button } from "./Button";

describe("Button", () => {
  it("reports a press", async () => {
    const onPress = jest.fn();
    await render(<Button label="Charge" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button", { name: "Charge" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not report a press while disabled", async () => {
    const onPress = jest.fn();
    await render(<Button label="Charge" onPress={onPress} disabled />);

    fireEvent.press(screen.getByRole("button", { name: "Charge" }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
