import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h1>
          <p className="mt-2 text-sm text-text-muted">Sign in to your account.</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
