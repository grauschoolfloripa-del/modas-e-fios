import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp|mp4)$).*)",
  ],
};
