// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { DownloadFirmwareButton } from "../components/DownloadFirmwareButton";

const url = "http://localhost:9000/static/1234-firmware.bin";

afterEach(cleanup);

describe("the download firmware button", () => {
  it("links to the official firmware as a download", () => {
    render(<DownloadFirmwareButton url={url} />);

    const link = screen.getByRole("link", { name: /Download official firmware/ });
    expect(link.getAttribute("href")).toBe(url);
    expect(link.hasAttribute("download")).toBe(true);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("renders nothing without a file", () => {
    const { container } = render(<DownloadFirmwareButton url={null} />);

    expect(container.innerHTML).toBe("");
  });

  it("has no axe violations", async () => {
    const { container } = render(<DownloadFirmwareButton url={url} />);

    const results = await axe.run(container, {
      // jsdom has no layout engine, so axe cannot compute contrast.
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
