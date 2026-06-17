import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { PageHero } from "@/components/PageHero";

export default function SignUpPage() {
  return (
    <div className="flex-1">
      <PageHero
        eyebrow="Join the town"
        title="Create your TypeForum account"
        description="Start threads, reply, vote, and track your rank."
      />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-xs text-slate-400">
          By signing up you agree to TypeForum community guidelines.
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
