import type { FormEvent } from "react";
import type { SitePage } from "../siteContent";

export type LoginFormState = {
  identifier: string;
  password: string;
};

export type SignupFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthPageProps = {
  mode: "login" | "signup";
  notice: string;
  error: string;
  loginForm: LoginFormState;
  signupForm: SignupFormState;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSignupSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoginFormChange: (form: LoginFormState) => void;
  onSignupFormChange: (form: SignupFormState) => void;
  onNavigate: (page: SitePage) => void;
};

function AuthPage({
  mode,
  notice,
  error,
  loginForm,
  signupForm,
  onLoginSubmit,
  onSignupSubmit,
  onLoginFormChange,
  onSignupFormChange,
  onNavigate
}: AuthPageProps) {
  return (
    <main className="app-shell auth-page">
      <section className="panel auth-card">
        <p className="eyebrow">{mode === "login" ? "Login" : "Signup"}</p>
        <h1>{mode === "login" ? "Login to your account" : "Create your account"}</h1>
        <p className="auth-copy">
          {mode === "login"
            ? "Enter your registered email or phone number and password."
            : "Register once, then login to open the Kundali generator."}
        </p>

        {notice && <div className="success-banner">{notice}</div>}
        {error && <div className="error-banner">{error}</div>}

        {mode === "login" ? (
          <form className="auth-form" onSubmit={onLoginSubmit}>
            <label>
              <span>Email or Phone</span>
              <input
                value={loginForm.identifier}
                onChange={(event) =>
                  onLoginFormChange({ ...loginForm, identifier: event.target.value })
                }
                placeholder="email@example.com or phone"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => onLoginFormChange({ ...loginForm, password: event.target.value })}
                placeholder="Enter password"
              />
            </label>
            <button type="submit" className="primary-button">
              Login
            </button>
            <p className="auth-switch">
              Not registered yet?{" "}
              <button type="button" onClick={() => onNavigate("signup")}>
                Signup
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={onSignupSubmit}>
            <label>
              <span>Name</span>
              <input
                value={signupForm.name}
                onChange={(event) => onSignupFormChange({ ...signupForm, name: event.target.value })}
                placeholder="Enter full name"
                required
                maxLength={120}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={signupForm.email}
                onChange={(event) => onSignupFormChange({ ...signupForm, email: event.target.value })}
                placeholder="email@example.com"
                required
                maxLength={255}
              />
            </label>
            <label>
              <span>Phone Number</span>
              <input
                type="tel"
                value={signupForm.phone}
                onChange={(event) => onSignupFormChange({ ...signupForm, phone: event.target.value })}
                placeholder="Enter phone number"
                required
                minLength={6}
                maxLength={32}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => onSignupFormChange({ ...signupForm, password: event.target.value })}
                placeholder="Create password"
                required
                minLength={8}
                maxLength={256}
              />
            </label>
            <button type="submit" className="primary-button">
              Register
            </button>
            <p className="auth-switch">
              Already registered?{" "}
              <button type="button" onClick={() => onNavigate("login")}>
                Login
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

export default AuthPage;
