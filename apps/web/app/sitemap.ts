import type { MetadataRoute } from "next";

const SITE_URL = "https://formright.org";

// Today's date — blog posts are current and share this lastModified.
const BLOG_UPDATED = "2026-08-14";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-07-28",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: BLOG_UPDATED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog/nonprofit-compliance-calendar`,
      lastModified: BLOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/form-990-n-guide`,
      lastModified: BLOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/best-nonprofit-formation-service`,
      lastModified: BLOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/glossary`,
      lastModified: BLOG_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: "2026-07-10",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: "2026-07-24",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: "2026-07-24",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: "2026-07-10",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: "2026-07-24",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: "2026-07-10",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: "2026-07-10",
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
