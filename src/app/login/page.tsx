import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { PageHero } from "@/components/PageHero";

export default function LoginPage() {
  return (
    <div className="flex-1">
      <PageHero eyebrow="Welcome back" title="Log in to TypeForum" />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to TypeForum community guidelines.
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          <Link href="/" className="text-brand-blue hover:text-white">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
