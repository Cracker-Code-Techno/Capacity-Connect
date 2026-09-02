import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Library",
  description: "Manage your recorded lectures, presentations, and study materials.",
};

export default function TrainerLibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}