import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import JobCard from "./JobCard";

describe("JobCard", () => {
  it("shows the job title and calls onToggle when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <MemoryRouter>
        <JobCard
          id={1}
          title="Frontend Developer"
          description="Build React applications"
          isOpen={false}
          onToggle={onToggle}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Frontend Developer")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Build React applications")
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Show description",
      })
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});