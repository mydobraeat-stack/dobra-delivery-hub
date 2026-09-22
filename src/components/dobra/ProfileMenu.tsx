import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Initials avatar used when the member has not uploaded a photo. */
export function InitialsAvatar({
  name,
  email,
  src,
  className,
}: {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  className?: string;
}) {
  const source = (name ?? "").trim() || (email ?? "").trim();
  const initials =
    source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand/40 bg-sun/30 text-lg font-bold text-foreground",
        className,
      )}
      aria-hidden
    >
      {src ? <img src={src} alt="" className="size-full object-cover object-center" /> : initials}
    </div>
  );
}

/** A single tappable row in the profile menu list. */
export function ProfileMenuItem({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to?: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <Icon className="size-5 shrink-0 text-foreground/70" aria-hidden />
      <span className="min-w-0 flex-1 text-base font-medium break-words text-foreground">
        {label}
      </span>
      <ChevronRight className="size-5 shrink-0 text-foreground/40" aria-hidden />
    </>
  );

  const classes =
    "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/60";

  if (to) {
    return (
      <li className="border-b border-ink/10 last:border-b-0">
        <Link to={to} className={classes}>
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-ink/10 last:border-b-0">
      <button type="button" onClick={onClick} className={classes}>
        {inner}
      </button>
    </li>
  );
}

export function ProfileMenuList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-card">{children}</ul>
  );
}
