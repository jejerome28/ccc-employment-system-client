import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

jest.mock("@/app/login/_components/LoginForm", () => ({ LoginForm: () => <form aria-label="login" /> }));

test("login shows CCC identity and the form", async () => {
  render(await LoginPage({ searchParams: Promise.resolve({}) } as never));
  expect(screen.getByRole("img", { name: "Human Resource Development Unit seal" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "City College of Calamba shield" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "Staff Time Records" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "Sign in" })).toBeInTheDocument();
});

test("expired notice still shows", async () => {
  render(await LoginPage({ searchParams: Promise.resolve({ expired: "1" }) } as never));
  expect(screen.getByRole("status")).toHaveTextContent("Your session expired. Sign in again.");
});
