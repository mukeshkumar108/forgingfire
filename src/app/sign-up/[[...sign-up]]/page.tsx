import { SignUp } from "@clerk/nextjs";

export default function Page() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p className="text-sm text-muted-foreground">
          configure Clerk env vars to enable sign-up.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <SignUp />
    </main>
  );
}
