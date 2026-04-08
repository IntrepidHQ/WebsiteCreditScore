import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LandingForm } from "@/features/landing/components/landing-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("LandingForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("shows an API error message", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Use a valid website URL." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<LandingForm />);

    await user.type(screen.getByLabelText(/run a live scan/i), "https://bad-url.test");
    await user.click(screen.getByRole("button", { name: /generate audit/i }));

    expect(await screen.findByText(/use a valid website url/i)).toBeInTheDocument();
  });

  it("shows a loading state and navigates to the audit report", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Response) => void = () => undefined;

    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    render(<LandingForm />);

    await user.type(screen.getByLabelText(/run a live scan/i), "https://example.com");
    await user.click(screen.getByRole("button", { name: /generate audit/i }));

    expect(
      screen.getByRole("button", { name: /generating audit/i }),
    ).toBeInTheDocument();

    resolveFetch(
      new Response(
        JSON.stringify({
          id: "example-com",
          normalizedUrl: "https://example.com",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        "/audit/example-com?url=https%3A%2F%2Fexample.com&ref=landing",
      ),
    );
  });
});
