export const dynamic = "force-static";

export function GET() {
  return new Response(
    [
      "Contact: mailto:hello@websitecreditscore.com",
      "Expires: 2027-05-15T00:00:00Z",
      "Preferred-Languages: en",
      "Canonical: https://websitecreditscore.com/.well-known/security.txt",
      "Policy: https://websitecreditscore.com/privacy",
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
