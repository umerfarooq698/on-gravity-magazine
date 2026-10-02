import type { Metadata } from "next";
import SearchPage from "./page";

export const metadata: Metadata = {
  title: "Search | On Gravity Magazine",
  description: "Search articles across all categories on On Gravity Magazine.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/search",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
