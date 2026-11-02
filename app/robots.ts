import { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/meta";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/search",
          "/glock-19-gen-5",
          "/feed",
          "/feed/",
          "/feed.xml",
          "/rss",
          "/rss/",
          "/rss.xml",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
