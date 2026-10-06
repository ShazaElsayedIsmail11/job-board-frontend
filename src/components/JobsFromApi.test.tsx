import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import JobsFromApi from "./JobsFromApi";

describe("JobsFromApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
it("shows an error when loading jobs fails", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
  });

  vi.stubGlobal("fetch", fetchMock);

  render(
    <MemoryRouter>
      <JobsFromApi />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("alert")
  ).toHaveTextContent("Could not load jobs");
});
  it("shows jobs returned from the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,

      json: async () => ({
        data: [
          {
            id: 1,
            title: "React Developer",
            description: "Build frontend apps",
          },
        ],

        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <JobsFromApi />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Loading jobs");

    expect(
      await screen.findByText("React Developer")
    ).toBeInTheDocument();
  });
});