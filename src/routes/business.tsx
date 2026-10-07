import { createFileRoute, redirect } from "@tanstack/react-router";

// Business accounts are not offered; keep the old URL working by sending visitors to Contact.
export const Route = createFileRoute("/business")({
  beforeLoad: () => {
    throw redirect({ to: "/contact", statusCode: 301 });
  },
});
