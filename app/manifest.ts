import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "O Galo",
    short_name: "O Galo",
    description: "Het Portugese nieuws, elke ochtend in het Nederlands.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3eee3",
    theme_color: "#1f3f78",
    lang: "nl",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
