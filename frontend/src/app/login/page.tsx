"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ScanLine, LogIn, Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setRole("Admin");
    setError("");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName, role);
      router.push(role === "Kitchen" ? "/kitchen" : "/admin");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Quick<span className="text-brand-500">Serve</span> QR
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === "login" ? "Sign in to access the dashboard" : "Create a new staff account"}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        {/* Form Card */}
        <div className="card">
          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><LogIn className="w-4 h-4" /> Sign In</>}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Kitchen">Kitchen Staff</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Cashier">Cashier</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {role === "Admin" && "Full access to dashboard, orders, menu, and tables"}
                  {role === "Kitchen" && "Access to kitchen dashboard and order management"}
                  {role === "Waiter" && "Access to kitchen dashboard for order tracking"}
                  {role === "Cashier" && "Access to kitchen dashboard for payment processing"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 bg-red-50"
                      : confirmPassword && confirmPassword === password
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={submitting || (!!confirmPassword && confirmPassword !== password)}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
              </button>
            </form>
          )}
        </div>

        {/* Back to home */}
        <p className="text-center">
          <button onClick={() => router.push("/")} className="text-sm text-gray-400 hover:text-brand-500 transition flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </button>
        </p>
      </div>
    </div>
  );
}