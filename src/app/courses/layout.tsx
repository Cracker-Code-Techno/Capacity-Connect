import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Catalog",
  description: "Explore and enroll in courses on Capacity Connect.",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}