import { useEffect, useState } from "react";
import { adminLogin, adminLogout, adminMe, type AdminUser, type ContentKind } from "../adminApi";
import ContentEditor from "./ContentEditor";
import { CONTENT_SPECS } from "./fieldSpecs";

function AdminLogin({ onSignedIn }: { onSignedIn: (admin: AdminUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      onSignedIn(await adminLogin(username, password));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell admin-login">
      <section className="panel">
        <p className="eyebrow">Administration</p>
        <h1>Sign in to the admin panel</h1>
        <p>
          This is a separate account from the public site. Admin accounts are created on the server
          with <code>python -m app.create_admin</code>.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Username</span>
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export function AdminApp({ onExit }: { onExit: () => void }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [resolved, setResolved] = useState(false);
  const [kind, setKind] = useState<ContentKind>("astrologers");

  useEffect(() => {
    let cancelled = false;
    void adminMe()
      .then((user) => {
        if (!cancelled) {
          setAdmin(user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAdmin(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setResolved(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!resolved) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">Administration</p>
          <h1>Checking your session...</h1>
        </section>
      </main>
    );
  }

  if (!admin) {
    return <AdminLogin onSignedIn={setAdmin} />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Administration</p>
          <strong>Kundali site content</strong>
        </div>
        <div className="admin-topbar-actions">
          <span>Signed in as {admin.name}</span>
          <button type="button" onClick={onExit}>
            View site
          </button>
          <button
            type="button"
            onClick={() => {
              void adminLogout().finally(() => setAdmin(null));
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Content types">
        {CONTENT_SPECS.map((spec) => (
          <button
            key={spec.kind}
            type="button"
            className={spec.kind === kind ? "active" : ""}
            onClick={() => setKind(spec.kind)}
          >
            {spec.title}
          </button>
        ))}
      </nav>

      <ContentEditor kind={kind} />
    </div>
  );
}

export default AdminApp;
