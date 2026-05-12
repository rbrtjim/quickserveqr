"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto" />
          <p className="text-sm text-gray-400 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <p className="text-5xl">🔒</p>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500">
            Required role: <strong>{allowedRoles.join(" or ")}</strong>
            <br />Your role: <strong>{user?.role}</strong>
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => router.push("/login")} className="btn-primary text-sm">Switch Account</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}