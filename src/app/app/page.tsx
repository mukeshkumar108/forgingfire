import { UserButton } from "@clerk/nextjs";

export default function AppPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="p-6">
      <div className="flex justify-end">
        {clerkEnabled ? <UserButton /> : null}
      </div>
      <h1 className="text-2xl font-semibold">Talkly</h1>
      <p className="text-muted-foreground">clerk auth works.</p>
    </main>
  );
}
