import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PhoneShellContext = createContext(false);

export function usePhoneShell() {
  return useContext(PhoneShellContext);
}

/** Max-width utility for bars/headers so they align with the phone frame. */
export function useShellMaxWidth() {
  return usePhoneShell() ? "max-w-[430px]" : "max-w-7xl";
}

/**
 * Locks customer/driver experiences to a centered, phone-width column with a
 * neutral backdrop on wide screens.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PhoneShellContext.Provider value={true}>
      <div className="flex min-h-screen w-full justify-center bg-ink/20">
        <div
          className={cn(
            "@container relative w-full max-w-[430px] bg-background shadow-2xl lg:border-x lg:border-ink/10 lg:min-h-screen",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </PhoneShellContext.Provider>
  );
}
