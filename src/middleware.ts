// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: "viralkatta-super-secret-key-2024-virralkatta",
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/((?!login$|login/).*)"],
};
