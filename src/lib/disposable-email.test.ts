import { describe, expect, it } from "vitest";
import { isDisposableEmail } from "@/lib/disposable-email";

describe("isDisposableEmail", () => {
  it("flags known disposable providers", () => {
    expect(isDisposableEmail("foo@mailinator.com")).toBe(true);
    expect(isDisposableEmail("test@guerrillamail.com")).toBe(true);
    expect(isDisposableEmail("x@yopmail.com")).toBe(true);
  });

  it("flags subdomains of disposable providers", () => {
    expect(isDisposableEmail("foo@inbox.mailinator.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isDisposableEmail("FOO@Mailinator.COM")).toBe(true);
  });

  it("allows real email providers", () => {
    expect(isDisposableEmail("founder@gmail.com")).toBe(false);
    expect(isDisposableEmail("ops@acmeplumbing.com")).toBe(false);
    expect(isDisposableEmail("jane@outlook.com")).toBe(false);
  });

  it("returns false for malformed input", () => {
    expect(isDisposableEmail("not-an-email")).toBe(false);
    expect(isDisposableEmail("@")).toBe(false);
    expect(isDisposableEmail("")).toBe(false);
  });
});
