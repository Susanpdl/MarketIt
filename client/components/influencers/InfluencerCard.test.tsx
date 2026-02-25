import { render, screen } from "@testing-library/react";
import { InfluencerCard } from "./InfluencerCard";

const mockInfluencer = {
  id: "inf-1",
  name: "Jane Doe",
  instagramHandle: "janedoe",
  email: "jane@example.com",
  status: "active",
  addedAt: "2025-01-15T00:00:00Z",
  posts: [{ id: "post-1" }],
};

describe("InfluencerCard", () => {
  it("renders influencer name and handle", () => {
    render(<InfluencerCard influencer={mockInfluencer} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("@janedoe")).toBeInTheDocument();
  });

  it("renders email when provided", () => {
    render(<InfluencerCard influencer={mockInfluencer} />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders post count", () => {
    render(<InfluencerCard influencer={mockInfluencer} />);
    expect(screen.getByText(/1 post\(s\)/)).toBeInTheDocument();
  });

  it("renders View analytics link with correct href", () => {
    render(<InfluencerCard influencer={mockInfluencer} />);
    const link = screen.getByRole("link", { name: /View analytics/i });
    expect(link).toHaveAttribute("href", "/analytics/inf-1");
  });

  it("renders status dropdown with correct options", () => {
    render(<InfluencerCard influencer={mockInfluencer} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("active");
    expect(screen.getByRole("option", { name: "Waiting" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
  });

  it("hides email when not provided", () => {
    const { email: _, ...noEmail } = mockInfluencer;
    render(<InfluencerCard influencer={{ ...noEmail, email: null }} />);
    expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
  });
});
