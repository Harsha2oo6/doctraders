import type { MetadataRoute } from "next";
import { env } from "@/server/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api"] },
    sitemap: `${env().APP_URL}/sitemap.xml`,
  };
}
