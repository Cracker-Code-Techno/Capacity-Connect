import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://capacity-connect.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/about", "/faq", "/privacy", "/contact"],
        disallow: ["/api/", "/admin/", "/trainer/", "/trainee/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
