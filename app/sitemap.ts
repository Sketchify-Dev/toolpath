import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/demo`, priority: 0.9 },
    { url: `${SITE_URL}/privacy`, priority: 0.3 },
  ];
}
