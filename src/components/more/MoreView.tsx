import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  HeartPulse,
  IdCard,
  Images,
  Inbox,
  MapPin,
  PawPrint,
  Shield,
  Sparkles,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SEED_OWNER } from "@/lib/seed";
import { TopBar } from "@/components/layout/TopBar";

const TILES = [
  { to: "/journal", label: "Journal", hint: "Timeline + voice", icon: BookOpen },
  { to: "/documents", label: "Passport", hint: "Shots on file", icon: FileText },
  { to: "/guide", label: "Guide", hint: "Species-strict AI", icon: Sparkles },
  { to: "/calendar", label: "Calendar", hint: "Due + booked", icon: CalendarDays },
  { to: "/care", label: "Walk & sit", hint: "Rover-style book", icon: PawPrint },
  { to: "/spend", label: "Spend", hint: "Where money went", icon: Wallet },
  { to: "/album", label: "Album", hint: "Faces worth keeping", icon: Images },
  { to: "/aid", label: "First aid", hint: "Same-hour rules", icon: HeartPulse },
  { to: "/train", label: "Train", hint: "2–4 min lessons", icon: Stethoscope },
  { to: "/travel", label: "Travel", hint: "BringFido-style", icon: MapPin },
  { to: "/cover", label: "Cover", hint: "Insurance plans", icon: Shield },
  { to: "/tag", label: "Lost ID", hint: "Chip + QR page", icon: IdCard },
  { to: "/inbox", label: "Inbox", hint: "Orders + nudges", icon: Inbox },
  { to: "/pets", label: "Household", hint: "Switch or add", icon: CreditCard },
] as const;

export function MoreView() {
  const { user, isPending } = useCurrentUserState();
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="More" kicker="The rest of the clinic" />
      <div className="px-3.5">
        <div className="reveal flex items-center justify-between rounded-xl bg-card px-3 py-2.5 ring-1 ring-line">
          <div className="flex items-center gap-2.5">
            {isPending ? (
              <span className="size-9 animate-pulse rounded-full bg-blush" />
            ) : (
              <img src={user?.profileImageUrl ?? SEED_OWNER.photo} alt="" className="size-9 rounded-full object-cover" />
            )}
            <div>
              <p className="text-[13px] font-semibold">{user?.displayName ?? SEED_OWNER.name}</p>
              <p className="text-[11px] text-muted">Passports stay on this phone</p>
            </div>
          </div>
          <SignedIn>
            <button type="button" onClick={() => void signOut()} className="text-[12px] font-medium text-sky-deep">
              Out
            </button>
          </SignedIn>
          <SignedOut>
            <Link to="/login" className="text-[12px] font-medium text-sky-deep">
              Sign in
            </Link>
          </SignedOut>
        </div>

        <div className="reveal d1 mt-3 grid grid-cols-2 gap-2">
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="press rounded-xl bg-card px-3 py-3 ring-1 ring-line">
                <Icon className="size-4 text-sky-deep" />
                <p className="mt-2 text-[13px] font-semibold">{t.label}</p>
                <p className="text-[11px] text-muted">{t.hint}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
