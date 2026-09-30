import { redirect } from "next/navigation";
import Home from "@/app/page";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

describe("Home page", () => {
  it("redirects to the dashboard", () => {
    Home();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
