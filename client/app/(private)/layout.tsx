"use client";
import { VerificationGuard } from "../hooks/VerificationGuard";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VerificationGuard allowPending={true}>
      {children}
    </VerificationGuard>
  );
}