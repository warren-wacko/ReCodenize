import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import type { User } from "../lib/types";

interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (
        element: HTMLElement,
        options: { theme: string; size: string; width: number },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google: Google;
  }
}
const Login = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          const { user } = await api<{ user: User }>("/api/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken: response.credential }),
          });
          setUser(user);
          navigate("/library");
        } catch (err) {
          toast.error("Sign-in failed");
          console.error(err);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "filled_black",
      size: "large",
      width: 280,
    });
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute"
        style={{
          width: 500,
          height: 300,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, oklch(82% 0.22 130 / 0.07) 0%, transparent 70%)",
        }}
      />
      <span
        className="flex items-center gap-2 text-[15px] font-medium tracking-[-0.02em] relative"
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
      </span>
      <h1 className="section-headline relative">Welcome back.</h1>
      <p
        className="relative max-w-sm"
        style={{ color: "var(--lp-text-mid)" }}
      >
        Sign in to save, share, and fork the prompts that make your AI write
        great code.
      </p>
      <div ref={buttonRef} className="relative" />
    </div>
  );
};

export default Login;
