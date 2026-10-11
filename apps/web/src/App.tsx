import { useState, type FormEvent } from "react";
import axios from "axios";
import { useAuth } from "./auth/AuthContext";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "The request failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function App() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
      } else {
        await login(email, password);
      }
      setPassword("");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setMessage("");
    try {
      await logout();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "64px auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>MERN Starter</h1>
      <p>React + TypeScript + Express + MongoDB</p>
      <hr />

      {isLoading && <p role="status">Checking your session...</p>}

      {user ? (
        <section aria-labelledby="account-heading">
          <h2 id="account-heading">You are signed in</h2>
          <p>Welcome, {user.name}.</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button type="button" onClick={() => void handleLogout()} disabled={busy}>
            Sign out
          </button>
        </section>
      ) : (
        <section aria-labelledby="auth-heading">
          <h2 id="auth-heading">{mode === "login" ? "Sign in" : "Create an account"}</h2>
          <form onSubmit={(event) => void handleSubmit(event)}>
            {mode === "register" && (
              <label style={{ display: "block", marginBottom: 12 }}>
                Name
                <input
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            )}
            <label style={{ display: "block", marginBottom: 12 }}>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Password
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={mode === "register" ? 12 : 1}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
              />
              {mode === "register" && <small>Use at least 12 characters.</small>}
            </label>
            <button type="submit" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p>
            {mode === "login" ? "New here? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </section>
      )}

      {message && <p role="alert">{message}</p>}
      <p style={{ color: "#666", fontSize: 12 }}>
        Starter authentication UI. Configure the API and MongoDB before using it.
      </p>
    </main>
  );
}
