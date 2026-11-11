import { describe, expect, it } from "vitest";
import { formatPosted, toApplication, toJobSummary } from "../src/serializers.js";

const NOW = new Date("2026-11-11T12:00:00.000Z");
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function at(millisecondsAgo: number): Date {
  return new Date(NOW.getTime() - millisecondsAgo);
}

describe("formatPosted", () => {
  it("returns 'just now' below one minute", () => {
    expect(formatPosted(at(0), NOW)).toBe("just now");
    expect(formatPosted(at(59 * SECOND), NOW)).toBe("just now");
  });

  it("formats minutes below one hour", () => {
    expect(formatPosted(at(60 * SECOND), NOW)).toBe("1 minute ago");
    expect(formatPosted(at(120 * SECOND), NOW)).toBe("2 minutes ago");
    expect(formatPosted(at(3599 * SECOND), NOW)).toBe("59 minutes ago");
  });

  it("formats hours below one day", () => {
    expect(formatPosted(at(60 * MINUTE), NOW)).toBe("1 hour ago");
    expect(formatPosted(at(120 * MINUTE), NOW)).toBe("2 hours ago");
    expect(formatPosted(at(86399 * SECOND), NOW)).toBe("23 hours ago");
  });

  it("formats days below one week", () => {
    expect(formatPosted(at(DAY), NOW)).toBe("1 day ago");
    expect(formatPosted(at(3 * DAY), NOW)).toBe("3 days ago");
    expect(formatPosted(at(6 * DAY), NOW)).toBe("6 days ago");
  });

  it("formats weeks below thirty days", () => {
    expect(formatPosted(at(7 * DAY), NOW)).toBe("1 week ago");
    expect(formatPosted(at(14 * DAY), NOW)).toBe("2 weeks ago");
    expect(formatPosted(at(29 * DAY), NOW)).toBe("4 weeks ago");
  });

  it("formats months using thirty day buckets", () => {
    expect(formatPosted(at(30 * DAY), NOW)).toBe("1 month ago");
    expect(formatPosted(at(60 * DAY), NOW)).toBe("2 months ago");
    expect(formatPosted(at(364 * DAY), NOW)).toBe("12 months ago");
  });

  it("formats years using three hundred sixty five day buckets", () => {
    expect(formatPosted(at(365 * DAY), NOW)).toBe("1 year ago");
    expect(formatPosted(at(730 * DAY), NOW)).toBe("2 years ago");
  });

  it("uses the singular form only when the count is exactly one", () => {
    expect(formatPosted(at(60 * SECOND), NOW)).toBe("1 minute ago");
    expect(formatPosted(at(120 * SECOND), NOW)).toBe("2 minutes ago");
    expect(formatPosted(at(60 * MINUTE), NOW)).toBe("1 hour ago");
    expect(formatPosted(at(120 * MINUTE), NOW)).toBe("2 hours ago");
    expect(formatPosted(at(DAY), NOW)).toBe("1 day ago");
    expect(formatPosted(at(2 * DAY), NOW)).toBe("2 days ago");
    expect(formatPosted(at(7 * DAY), NOW)).toBe("1 week ago");
    expect(formatPosted(at(14 * DAY), NOW)).toBe("2 weeks ago");
    expect(formatPosted(at(30 * DAY), NOW)).toBe("1 month ago");
    expect(formatPosted(at(60 * DAY), NOW)).toBe("2 months ago");
    expect(formatPosted(at(365 * DAY), NOW)).toBe("1 year ago");
    expect(formatPosted(at(730 * DAY), NOW)).toBe("2 years ago");
  });

  it("defaults to the current time when no reference date is given", () => {
    expect(formatPosted(new Date())).toBe("just now");
    expect(formatPosted(new Date(Date.now() - 5 * MINUTE))).toBe("5 minutes ago");
  });
});

const jobPost = {
  id: "job_1",
  title: "Frontend Engineer",
  description: "Build and ship the web app.",
  company: "Acme Ltd",
  jobType: "Full time",
  category: "Engineering",
  salaryAmount: 2200,
  salaryFrom: true,
  salaryEst: false,
  rating: 4.5,
  reviews: 12,
  authorId: "user_9",
  createdAt: new Date(Date.now() - 3 * MINUTE),
  updatedAt: new Date(),
};

describe("toJobSummary", () => {
  it("returns exactly the summary keys in order", () => {
    const summary = toJobSummary(jobPost);

    expect(Object.keys(summary)).toEqual([
      "id",
      "title",
      "description",
      "company",
      "jobType",
      "category",
      "salaryAmount",
      "salaryFrom",
      "salaryEst",
      "rating",
      "reviews",
      "createdAt",
      "posted",
    ]);
  });

  it("omits authorId", () => {
    const summary = toJobSummary(jobPost);

    expect("authorId" in summary).toBe(false);
    expect(Object.keys(summary)).not.toContain("authorId");
  });

  it("maps the job fields onto the summary", () => {
    const summary = toJobSummary(jobPost);

    expect(summary.id).toBe("job_1");
    expect(summary.title).toBe("Frontend Engineer");
    expect(summary.description).toBe("Build and ship the web app.");
    expect(summary.company).toBe("Acme Ltd");
    expect(summary.jobType).toBe("Full time");
    expect(summary.category).toBe("Engineering");
    expect(summary.salaryAmount).toBe(2200);
    expect(summary.salaryFrom).toBe(true);
    expect(summary.salaryEst).toBe(false);
    expect(summary.rating).toBe(4.5);
    expect(summary.reviews).toBe(12);
  });

  it("returns createdAt as an ISO string and derives posted from it", () => {
    const summary = toJobSummary(jobPost);

    expect(summary.createdAt).toBe(jobPost.createdAt.toISOString());
    expect(summary.posted).toBe("3 minutes ago");
  });

  it("keeps nullable fields present as null", () => {
    const sparsePost = {
      ...jobPost,
      company: null,
      jobType: null,
      category: null,
      salaryAmount: null,
      salaryFrom: null,
      salaryEst: null,
      rating: null,
      reviews: null,
    };

    const summary = toJobSummary(sparsePost);

    expect(Object.keys(summary)).toHaveLength(13);
    expect(summary.company).toBeNull();
    expect(summary.jobType).toBeNull();
    expect(summary.category).toBeNull();
    expect(summary.salaryAmount).toBeNull();
    expect(summary.salaryFrom).toBeNull();
    expect(summary.salaryEst).toBeNull();
    expect(summary.rating).toBeNull();
    expect(summary.reviews).toBeNull();
    expect("company" in summary).toBe(true);
    expect("salaryAmount" in summary).toBe(true);
  });
});

const jobApplication = {
  id: "app_1",
  postId: "job_1",
  applicantId: "user_9",
  status: "SUBMITTED",
  createdAt: new Date("2026-11-01T09:00:00.000Z"),
  updatedAt: new Date("2026-11-02T09:00:00.000Z"),
  post: {
    id: "job_1",
    title: "Frontend Engineer",
    company: "Acme Ltd",
    authorId: "user_2",
  },
};

describe("toApplication", () => {
  it("returns exactly the application keys in order", () => {
    const serialized = toApplication(jobApplication);

    expect(Object.keys(serialized)).toEqual([
      "id",
      "postId",
      "status",
      "createdAt",
      "updatedAt",
      "post",
    ]);
  });

  it("maps the application fields and ISO timestamps", () => {
    const serialized = toApplication(jobApplication);

    expect(serialized.id).toBe("app_1");
    expect(serialized.postId).toBe("job_1");
    expect(serialized.status).toBe("SUBMITTED");
    expect(serialized.createdAt).toBe("2026-11-01T09:00:00.000Z");
    expect(serialized.updatedAt).toBe("2026-11-02T09:00:00.000Z");
  });

  it("returns only the post summary", () => {
    const serialized = toApplication(jobApplication);

    expect(Object.keys(serialized.post)).toEqual(["id", "title", "company"]);
    expect(serialized.post).toEqual({
      id: "job_1",
      title: "Frontend Engineer",
      company: "Acme Ltd",
    });
  });

  it("keeps a missing company as null", () => {
    const serialized = toApplication({
      ...jobApplication,
      post: { ...jobApplication.post, company: null },
    });

    expect(Object.keys(serialized.post)).toEqual(["id", "title", "company"]);
    expect(serialized.post.company).toBeNull();
  });
});
