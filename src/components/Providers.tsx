"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { ApiTokenContext } from "../lib/api/useApiToken";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkTokenBridge({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  return <ApiTokenContext.Provider value={getToken}>{children}</ApiTokenContext.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkTokenBridge>{children}</ClerkTokenBridge>
    </ClerkProvider>
  );
}
