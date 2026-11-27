import { resolveAuthRedirect } from "./auth-routing";

describe("the POS auth redirect", () => {
  it("waits for the stored session", () => {
    expect(resolveAuthRedirect({ ready: false, hasToken: false, pathname: "/" })).toBeNull();
    expect(resolveAuthRedirect({ ready: false, hasToken: true, pathname: "/login" })).toBeNull();
  });

  it("sends a signed-out cashier to the login screen", () => {
    expect(resolveAuthRedirect({ ready: true, hasToken: false, pathname: "/" })).toBe("login");
    expect(resolveAuthRedirect({ ready: true, hasToken: false, pathname: "/orders" })).toBe(
      "login",
    );
    expect(resolveAuthRedirect({ ready: true, hasToken: false, pathname: "/payment" })).toBe(
      "login",
    );
  });

  it("keeps a signed-out cashier on the login screen", () => {
    expect(resolveAuthRedirect({ ready: true, hasToken: false, pathname: "/login" })).toBeNull();
  });

  it("closes the login screen once there is a session", () => {
    expect(resolveAuthRedirect({ ready: true, hasToken: true, pathname: "/login" })).toBe("home");
  });

  it("leaves every other route alone when signed in", () => {
    expect(resolveAuthRedirect({ ready: true, hasToken: true, pathname: "/" })).toBeNull();
    expect(resolveAuthRedirect({ ready: true, hasToken: true, pathname: "/orders" })).toBeNull();
  });
});
