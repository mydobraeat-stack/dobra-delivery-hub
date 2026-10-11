import { describe, expect, it } from "vitest";
import { dialCodeFor, normalizePhone, validatePhone } from "./phone";

describe("phone numbers", () => {
  it("defaults the dial code to +48 for Poland and +237 for Cameroon", () => {
    expect(dialCodeFor("Poland")).toBe("+48");
    expect(dialCodeFor("Cameroon")).toBe("+237");
  });

  it("accepts a Polish number with 9 digits after +48", () => {
    expect(validatePhone("+48 600 123 456")).toBeNull();
    expect(normalizePhone("+48 600-123-456")).toBe("+48600123456");
  });

  it("rejects a Polish number with the wrong length", () => {
    expect(validatePhone("+48 600 123 45")).toBe("length");
  });

  it("accepts a Cameroon number with 9 digits after +237", () => {
    expect(validatePhone("+237 6 71 23 45 67")).toBeNull();
    expect(validatePhone("+237 671 234 56")).toBe("length");
  });

  it("requires the international + prefix", () => {
    expect(validatePhone("600123456")).toBe("format");
  });

  it("treats an empty field or a bare dial code as missing", () => {
    expect(validatePhone("")).toBe("required");
    expect(validatePhone("+48 ")).toBe("required");
    expect(validatePhone("+48", false)).toBeNull();
  });
});
