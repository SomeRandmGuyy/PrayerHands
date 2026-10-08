import { describe, expect, it } from "vitest";
import { isRelativeAppPath } from "#/api/provider-subscription-service.api";

describe("isRelativeAppPath", () => {
  it("accepts app paths and rejects absolute login urls", () => {
    expect(isRelativeAppPath("/settings/providers")).toBe(true);
    expect(isRelativeAppPath("/settings/providers?signed_in=1")).toBe(true);
    expect(isRelativeAppPath("https://hands.example/settings/providers")).toBe(
      false,
    );
    expect(isRelativeAppPath("//evil.example/settings")).toBe(false);
    expect(isRelativeAppPath("http://localhost:3000/settings")).toBe(false);
  });
});
