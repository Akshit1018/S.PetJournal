import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-sky">
      <span className="cloud left-[8%] top-[12%] h-12 w-32" />
      <span className="cloud right-[10%] top-[22%] h-10 w-28" />
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center px-6 py-12">
        <p className="text-sm font-medium text-card/80">PetJournal</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-card">
          Keep every species honest.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-card/85">
          Sign in to carry passports across devices. The household on this phone still works as a guest.
        </p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="sun"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-card/80">Sign-in is disabled in this environment.</p>
          )}
        </div>
        <Link to="/" className="mt-6 text-center text-sm font-medium text-card underline-offset-4 hover:underline">
          Back to the journal
        </Link>
      </div>
    </main>
  );
}
