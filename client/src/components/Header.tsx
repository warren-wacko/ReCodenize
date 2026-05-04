import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-[13px] tracking-[0.01em] transition-colors ${
    isActive
      ? "text-foreground"
      : "text-[var(--lp-text-mid)] hover:text-foreground"
  }`;

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    if (loading) fetchMe();
  }, [loading, fetchMe]);

  // Hide on login + landing — those routes ship their own nav
  if (location.pathname === "/login" || location.pathname === "/") return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ background: "oklch(10% 0.012 260 / 0.85)" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-10 h-14 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-medium text-[15px] tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--lp-accent)",
              boxShadow: "0 0 10px var(--lp-accent-glow)",
            }}
          />
          ReCodenize
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          <NavLink to="/explore" className={linkClass}>
            Explore
          </NavLink>
          {user && (
            <NavLink to="/library" className={linkClass}>
              Library
            </NavLink>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="truncate">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !loading && (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-1.5 rounded-md text-[13px] font-medium tracking-[0.01em] transition-[filter,transform] hover:brightness-110 hover:-translate-y-px"
                style={{
                  background: "var(--lp-accent)",
                  color: "var(--lp-accent-fg)",
                }}
              >
                Sign in
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
