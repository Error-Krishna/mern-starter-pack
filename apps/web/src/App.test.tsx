import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";

vi.mock("./lib/api/client", () => ({
  apiClient: {
    post: vi.fn().mockRejectedValue(new Error("API unavailable in component test")),
    interceptors: { request: { use: vi.fn() } },
  },
}));

describe("App", () => {
  it("renders the starter application heading", () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    );

    expect(screen.getByRole("heading", { name: "MERN Starter" })).toBeInTheDocument();
  });

  it("renders the sign-in form", () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });
});
