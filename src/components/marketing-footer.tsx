import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Logo tagline />
          <p className="mt-4 max-w-xs text-sm text-[var(--foreground)]/60">
            A focused academic resource platform for students, lecturers, and institutions to discover,
            publish, and manage trusted study material.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/60">
            <li><Link href="/explore" className="hover:text-teal-500">Explore resources</Link></li>
            <li><Link href="/pricing" className="hover:text-teal-500">Pricing</Link></li>
            <li><Link href="/register" className="hover:text-teal-500">Create an account</Link></li>
            <li><Link href="/register?role=lecturer" className="hover:text-teal-500">Become a lecturer contributor</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/60">
            <li><Link href="/#how-it-works" className="hover:text-teal-500">How it works</Link></li>
            <li><Link href="/#faq" className="hover:text-teal-500">FAQ</Link></li>
            <li><Link href="/login" className="hover:text-teal-500">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)]">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]/60">
            <li>Terms of service <span className="text-xs">(coming soon)</span></li>
            <li>Privacy policy <span className="text-xs">(coming soon)</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border-subtle)] py-6 text-center text-xs text-[var(--foreground)]/50">
        © {new Date().getFullYear()} KnowVa. All rights reserved.
      </div>
    </footer>
  );
}
