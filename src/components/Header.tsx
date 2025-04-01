import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-lg">
            Notes
          </Link>
          <Link href="/tags" className="text-gray-600 hover:text-gray-900">
            Tags
          </Link>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
} 