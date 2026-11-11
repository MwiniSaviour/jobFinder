const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;
const YEAR_DAYS = 365;

export type JobPostLike = {
  id: string;
  title: string;
  description: string;
  company: string | null;
  jobType: string | null;
  category: string | null;
  salaryAmount: number | null;
  salaryFrom: boolean | null;
  salaryEst: boolean | null;
  rating: number | null;
  reviews: number | null;
  createdAt: Date;
  [key: string]: unknown;
};

export type JobPostRelationLike = {
  id: string;
  title: string;
  company: string | null;
  [key: string]: unknown;
};

export type JobApplicationLike<TStatus extends string = string> = {
  id: string;
  postId: string;
  status: TStatus;
  createdAt: Date;
  updatedAt: Date;
  post: JobPostRelationLike;
  [key: string]: unknown;
};

export type JobSummary = {
  id: string;
  title: string;
  description: string;
  company: string | null;
  jobType: string | null;
  category: string | null;
  salaryAmount: number | null;
  salaryFrom: boolean | null;
  salaryEst: boolean | null;
  rating: number | null;
  reviews: number | null;
  createdAt: string;
  posted: string;
};

export type ApplicationSummary<TStatus extends string = string> = {
  id: string;
  postId: string;
  status: TStatus;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    company: string | null;
  };
};

function ago(count: number, unit: string): string {
  return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`;
}

export function formatPosted(createdAt: Date, now: Date = new Date()): string {
  const elapsed = now.getTime() - createdAt.getTime();

  if (elapsed < MINUTE) {
    return "just now";
  }

  const minutes = Math.floor(elapsed / MINUTE);
  if (minutes < 60) {
    return ago(minutes, "minute");
  }

  const hours = Math.floor(elapsed / HOUR);
  if (hours < 24) {
    return ago(hours, "hour");
  }

  const days = Math.floor(elapsed / DAY);
  if (days < WEEK_DAYS) {
    return ago(days, "day");
  }

  if (days < MONTH_DAYS) {
    return ago(Math.floor(days / WEEK_DAYS), "week");
  }

  if (days < YEAR_DAYS) {
    return ago(Math.floor(days / MONTH_DAYS), "month");
  }

  return ago(Math.floor(days / YEAR_DAYS), "year");
}

export function toJobSummary(post: JobPostLike): JobSummary {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    company: post.company,
    jobType: post.jobType,
    category: post.category,
    salaryAmount: post.salaryAmount,
    salaryFrom: post.salaryFrom,
    salaryEst: post.salaryEst,
    rating: post.rating,
    reviews: post.reviews,
    createdAt: post.createdAt.toISOString(),
    posted: formatPosted(post.createdAt),
  };
}

export function toApplication<TStatus extends string>(
  app: JobApplicationLike<TStatus>,
): ApplicationSummary<TStatus> {
  return {
    id: app.id,
    postId: app.postId,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    post: {
      id: app.post.id,
      title: app.post.title,
      company: app.post.company,
    },
  };
}
