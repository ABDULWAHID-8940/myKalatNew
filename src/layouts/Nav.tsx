"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Nav({ path }: { path: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (paths: string) => pathname === `/${path}` + paths;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="grid grid-cols-3 items-center px-4 xl:px-[70px] sticky top-0 z-20 border-b h-16 shadow-xs backdrop-blur-lg bg-gray-100/60 ">
        <div className="flex items-center">
          <Link href={`/${path}/`} className="flex items-center">
            <span className="text-xl  text-primary">Mykalat</span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="flex justify-end items-center col-span-2">
          <nav className="hidden sm:flex justify-center text-gray-600">
            {path === "business" && (
              <Link
                href={"/business/influencers"}
                className={`hover:text-primary transition px-5 py-2  ${
                  isActive("/influencers")
                    ? "text-primary underline-offset-8 underline"
                    : ""
                }`}
                onClick={closeMobileMenu}
              >
                Influencers
              </Link>
            )}

            {path === "business" && (
              <Link
                href={"/business/myjobs"}
                className={`hover:text-primary transition px-5 py-2  ${
                  isActive("/myjobs")
                    ? "text-primary underline-offset-8 underline"
                    : ""
                }`}
                onClick={closeMobileMenu}
              >
                myJobs
              </Link>
            )}

            <Link
              href={`/${path}/message`}
              className={`hover:text-primary transition px-5 py-2 ${
                isActive("/message")
                  ? "text-primary underline-offset-8 underline"
                  : ""
              }`}
              onClick={closeMobileMenu}
            >
              Messages
            </Link>

            <Link
              href={`/${path}/contract`}
              className={`hover:text-primary transition px-5 py-2 ${
                isActive("/contract")
                  ? "text-primary underline-offset-8 underline"
                  : ""
              }`}
              onClick={closeMobileMenu}
            >
              Contract
            </Link>
            <Link
              href={`/${path}/profile`}
              className={`hover:text-primary transition px-5 py-2 ${
                isActive("/profile")
                  ? "text-primary underline-offset-8 underline"
                  : ""
              }`}
              onClick={closeMobileMenu}
            >
              Profile
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden ml-3 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden fixed inset-x-0 top-16 z-20 bg-white pt-4 px-4 pb-6 rounded-b-lg shadow-md"
        >
          <div className="flex flex-col space-y-4">
            {path === "business" && (
              <Link
                href={"/business/influencers"}
                className={`hover:text-primary transition px-5 py-2  ${
                  isActive("/influencers")
                    ? "text-primary underline-offset-8 underline"
                    : ""
                }`}
                onClick={closeMobileMenu}
              >
                Influencers
              </Link>
            )}

            {path === "business" && (
              <Link
                href={"/business/myjobs"}
                className={`text-lg px-4 py-3 rounded-lg ${
                  isActive("/myjobs")
                    ? "bg-blue-50 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={closeMobileMenu}
              >
                myJobs
              </Link>
            )}

            {/* <Link
              href={`/${path}/${path === "business" ? "myjobs" : "dashboard"}`}
              className={`hover:text-primary transition px-5 py-2  ${
                isActive("/dashboard")
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={closeMobileMenu}
            >
              {path === "business" ? "My jobs" : "Dashboard"}
            </Link> */}

            <Link
              href={`/${path}/message`}
              className={`text-lg px-4 py-3 rounded-lg ${
                isActive("/message")
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={closeMobileMenu}
            >
              Message
            </Link>

            <Link
              href={`/${path}/contract`}
              className={`text-lg px-4 py-3 rounded-lg ${
                isActive("/contract")
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={closeMobileMenu}
            >
              Contract
            </Link>
            <Link
              href={`/${path}/profile`}
              className={`text-lg px-4 py-3 rounded-lg ${
                isActive("/profile")
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={closeMobileMenu}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
