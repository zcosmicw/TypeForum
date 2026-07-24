import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/forums");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-muted">Join the community and start posting.</p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
