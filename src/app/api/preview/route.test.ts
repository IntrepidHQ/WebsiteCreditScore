import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/preview", () => {
  it("returns 400 when url is missing", async () => {
    const res = await GET(new Request("http://localhost/api/preview"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when device is invalid", async () => {
    const res = await GET(
      new Request("http://localhost/api/preview?url=https%3A%2F%2Fexample.com&device=tablet"),
    );
    expect(res.status).toBe(400);
  });
});
