import { describe, it, expect } from "vitest";
import { formatDate } from "../formatDate";

describe("formatDate", () => {
  it("returns null for null input", () => {
    expect(formatDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatDate("")).toBeNull();
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2020-06-15");
    expect(result).toBe("Jun 2020");
  });

  it("formats a full ISO datetime string", () => {
    const result = formatDate("2023-01-01T00:00:00.000Z");
    expect(result).toBe("Jan 2023");
  });

  it("formats a year-only string as a date", () => {
    expect(formatDate("2020")).toBe("Jan 2020");
  });

  it("passes through Present unchanged", () => {
    expect(formatDate("Present")).toBe("Present");
  });

  it("handles edge date like epoch", () => {
    const result = formatDate("1970-01-01");
    expect(result).toBe("Jan 1970");
  });
});
