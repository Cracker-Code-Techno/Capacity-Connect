import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col w-full relative">
      {children}
    </div>
  );
}
