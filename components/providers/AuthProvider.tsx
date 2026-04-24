'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // CRITICAL: Disable ALL cross-tab synchronization
  // This prevents BroadcastChannel from syncing session across tabs
  // Each tab maintains completely isolated session perception
  return (
    <SessionProvider 
      refetchOnWindowFocus={false}
      refetchInterval={0}
      // Note: NextAuth v4 doesn't have explicit broadcastChannel option
      // But we work around this by not reacting to session changes in hooks
    >
      {children}
    </SessionProvider>
  );
}
