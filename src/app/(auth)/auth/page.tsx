"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Meh,
  Building2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

type AuthMode = "signin" | "signup";
type UserType = "influencer" | "business" | "admin";
const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<UserType>("influencer");
  const searchParams = useSearchParams();

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signin" || modeParam === "signup") {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn();
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        await signUp();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const signIn = async () => {
    await authClient.signIn.email(
      {
        email: email,
        password: password,
        callbackURL: "/api/auth/callback",
      },
      {
        onRequest: () => {
          console.log("loading ...");
        },
        onSuccess: () => {
          console.log("sign-in successful");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "sign-in failed");
          // if (ctx.error.status === 403) {
          //   router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          // }
        },
      },
    );
  };

  const signUp = async () => {
    console.log("userType from frontend is ",userType);
    await authClient.signUp.email(
      {
        email: email,
        password: password,
        name: name,
        userType,
        callbackURL: "/api/auth/callback",
      }as any,
      {
        onRequest: () => {
          console.log("loading...");
        },
        onSuccess: () => {
          setError("");
          setEmail("");
          setPassword("");
          setName("");
          setConfirmPassword("");
          window.location.href = "/api/auth/callback";
        },
        onError: (ctx) => {
          setError(ctx.error.message || "sign-up failed");
        },
      },
    );
  };

  return (
    <div className="min-h-dvh bg-gray-300 flex items-center justify-center ">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 transition-all duration-300 "
        style={{
          transform: "scale(0.9)",
          transformOrigin: "center",
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-gray-600">
            {mode === "signin"
              ? "Sign in to access your account"
              : "Sign up to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 focus:border-primary focus:ring-primary focus:outline-none rounded-sm transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <div className="">
                <label className="block text-sm font-medium mb-2">
                  I am signing up as:
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setUserType("influencer")}
                    className={`py-2 px-4 border rounded-sm transition-colors cursor-pointer ${
                      userType === "influencer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Digital marketer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("business")}
                    className={`py-2 px-4 border rounded-sm transition-colors cursor-pointer ${
                      userType === "business"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Business Owner
                  </button>
                </div>
              </div>
              <label className="block text-sm font-medium my-2">
                {userType === "influencer" ? "Your Name" : "Business Name"}
              </label>
              <div className="relative">
                {userType === "business" ? (
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                ) : (
                  <Meh className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 focus:border-primary focus:ring-primary focus:outline-none rounded-sm transition-colors"
                  placeholder={
                    userType === "influencer"
                      ? "Enter your full name"
                      : "Enter your business name"
                  }
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative w-full">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 focus:border-primary focus:ring-primary focus:outline-none rounded-sm transition-colors"
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {!showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center pt-2 ">
                {error}
              </div>
            )}
          </div>

          {mode === "signup" && (
            <div className="relative ">
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 focus:border-primary focus:ring-primary focus:outline-none rounded-sm transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-primary text-white py-2.5 rounded-sm hover:bg-[#0c9578] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer flex items-center justify-center disabled:cursor-not-allowed ${
              mode === "signin" && "mt-8"
            }`}
            disabled={loading}
          >
            {mode === "signin" ? "Sign in" : "Create account"}{" "}
            {loading ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-gray-600">
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="font-medium text-[#0c9578] hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
