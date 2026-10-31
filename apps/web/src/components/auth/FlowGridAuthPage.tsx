"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useAccount } from "../../context/account-context";
import { api } from "../../lib/api";
import { GoogleSignIn } from "./GoogleSignIn";

type AuthMode = "login" | "register";

function AuthPeriodGear({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="flowgrid-auth-period"
      initial={reducedMotion ? false : { rotate: -120, scale: 0, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.16 }
      }
    >
      <svg className={reducedMotion ? "" : "flowgrid-pinwheel"} viewBox="0 0 32 32" fill="none">
        <path d="M16 16C8.8 16 5.7 12.2 7.4 8.5 9.2 4.8 14.3 5.3 16 16Z" fill="#4C6FFF" />
        <path d="M16 16C16 8.8 19.8 5.7 23.5 7.4 27.2 9.2 26.7 14.3 16 16Z" fill="#FF6B4A" />
        <path d="M16 16C23.2 16 26.3 19.8 24.6 23.5 22.8 27.2 17.7 26.7 16 16Z" fill="#1DB876" />
        <path d="M16 16C16 23.2 12.2 26.3 8.5 24.6 4.8 22.8 5.3 17.7 16 16Z" fill="#9B5DE5" />
      </svg>
    </motion.span>
  );
}

function PebbleLoader({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5" aria-label="Loading">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-white"
          animate={
            reducedMotion
              ? undefined
              : { y: [0, -4, 0], opacity: [0.55, 1, 0.55], scale: [0.9, 1.08, 0.9] }
          }
          transition={{ duration: 0.72, repeat: Infinity, delay: dot * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, height: 0, y: -3 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -3 }}
      className="overflow-hidden pt-1.5 text-xs text-rose-600"
      role="alert"
      id={id}
    >
      {children}
    </motion.p>
  );
}

function PinwheelHeading({ mode, reducedMotion }: { mode: AuthMode; reducedMotion: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.h1
        key={mode}
        initial={reducedMotion ? false : { opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
        transition={{ duration: reducedMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="text-center text-[2rem] font-semibold leading-tight tracking-[-0.055em] text-[#17172e] sm:text-[2.4rem]"
      >
        {mode === "login" ? "Welcome back" : "Create your account"}
        <AuthPeriodGear reducedMotion={reducedMotion} />
      </motion.h1>
    </AnimatePresence>
  );
}

function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  trailing,
  inputMode,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  trailing?: ReactNode;
  inputMode?: "email" | "text";
}) {
  return (
    <div className="min-w-0">
      <div className={`auth-field-shell ${error ? "auth-field-error" : ""}`}>
        <label htmlFor={id} className="auth-field-label">
          {label}
        </label>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="auth-field-input"
          required
        />
        {trailing}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <FieldError id={`${id}-error`} key="error">
            {error}
          </FieldError>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FlowGridAuthPage({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter();
  const { setAuthenticatedAccount } = useAccount();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncMode = () => setMode(window.location.pathname === "/register" ? "register" : "login");
    window.addEventListener("popstate", syncMode);
    return () => window.removeEventListener("popstate", syncMode);
  }, []);

  const changeMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setError(null);
    setFieldErrors({});
    setMode(nextMode);
    window.history.pushState({}, "", nextMode === "login" ? "/login" : "/register");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (mode === "register") {
      const errors: Record<string, string> = {};
      if (password.length < 8) errors.password = "Use at least 8 characters.";
      else if (!/[A-Z]/.test(password)) errors.password = "Add at least one uppercase letter.";
      else if (!/[a-z]/.test(password)) errors.password = "Add at least one lowercase letter.";
      else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        errors.password = "Add at least one special character.";
      }
      if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      const response =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, password, first_name: firstName, last_name: lastName });
      if (typeof window !== "undefined")
        window.localStorage.setItem("access_token", response.access);
      const hasBusinessAccess = response.workspaces.some(
        (workspace) => workspace.user_role !== "CUSTOMER"
      );
      setAuthenticatedAccount(
        response.user,
        response.workspaces,
        hasBusinessAccess ? "PROFESSIONAL" : "PERSONAL"
      );
      if (mode === "register") {
        router.push("/account");
      } else {
        router.push(hasBusinessAccess ? "/dashboard" : "/portal");
      }
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthenticated = async (
    response: Awaited<ReturnType<typeof api.googleLogin>>
  ) => {
    const hasBusinessAccess = response.workspaces.some(
      (workspace) => workspace.user_role !== "CUSTOMER"
    );
    const context = hasBusinessAccess ? "PROFESSIONAL" : "PERSONAL";
    setAuthenticatedAccount(response.user, response.workspaces, context);
    router.push(hasBusinessAccess ? "/dashboard" : "/portal");
  };

  const copy =
    mode === "login"
      ? "Sign in to manage your businesses, subscriptions and billing."
      : "Start managing your businesses, products and subscriptions with FlowGrid.";

  return (
    <main className="flowgrid-auth-page" data-auth-mode={mode}>
      <div className="flowgrid-auth-glows" aria-hidden="true">
        <span className="auth-glow auth-glow-blue" />
        <span className="auth-glow auth-glow-green" />
        <span className="auth-glow auth-glow-purple" />
        <span className="auth-glow auth-glow-cyan" />
        <span className="auth-glow auth-glow-warm" />
      </div>

      <motion.section
        layout
        transition={{
          layout: { duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
        className="flowgrid-auth-content"
      >
        <Link href="/" className="flowgrid-auth-logo" aria-label="FlowGrid home">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 4.5h16l-4.5 6H3v-6z" />
            <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
          </svg>
          <span>FLOWGRID</span>
        </Link>

        <div className="flowgrid-auth-intro">
          <PinwheelHeading mode={mode} reducedMotion={shouldReduceMotion} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={mode}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {copy}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div layout className="flowgrid-auth-form-wrap">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key="form-error"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
                className="auth-form-error"
                role="alert"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form layout onSubmit={submit} className="flowgrid-auth-form">
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  key="name-fields"
                  layout
                  initial={shouldReduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="auth-name-row"
                >
                  <AuthInput
                    id="first-name"
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    autoComplete="given-name"
                  />
                  <AuthInput
                    id="last-name"
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    autoComplete="family-name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              id="email"
              label="Email address"
              type="email"
              inputMode="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={fieldErrors.email}
            />

            <div className="auth-password-group">
              <AuthInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                error={fieldErrors.password}
                trailing={
                  <button
                    type="button"
                    className="auth-visibility-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
              {mode === "login" && (
                <Link href="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              )}
            </div>

            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  key="confirm-field"
                  initial={shouldReduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <AuthInput
                    id="confirm-password"
                    label="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    error={fieldErrors.confirmPassword}
                    trailing={
                      <button
                        type="button"
                        className="auth-visibility-toggle"
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        aria-label={showConfirmPassword ? "Hide confirmation" : "Show confirmation"}
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading ? (
                <PebbleLoader reducedMotion={shouldReduceMotion} />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign in" : "Create account"}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </motion.form>

          <GoogleSignIn onAuthenticated={handleGoogleAuthenticated} />

          <p className="flowgrid-auth-switch">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => changeMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </motion.div>

        <p className="flowgrid-auth-footer">© {new Date().getFullYear()} FlowGrid Technologies</p>
      </motion.section>
    </main>
  );
}
