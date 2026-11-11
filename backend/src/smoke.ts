type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const baseUrl = (process.env.JF_SMOKE_BASE ?? "http://localhost:4002").replace(/\/+$/, "");

function expectStatus(response: Response, expected: number, label: string): void {
  if (response.status !== expected) {
    throw new Error(`${label}: expected status ${expected}, received ${response.status}`);
  }
}

async function runCheck(name: string, check: () => Promise<string>): Promise<CheckResult> {
  try {
    return { name, ok: true, detail: await check() };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { name, ok: false, detail };
  }
}

async function checkHealth(): Promise<string> {
  const response = await fetch(`${baseUrl}/health`);
  expectStatus(response, 200, "health");
  const body = (await response.json()) as { ok?: boolean };
  if (body.ok !== true) {
    throw new Error(`health: expected { ok: true }, received ${JSON.stringify(body)}`);
  }
  return "200 ok";
}

async function checkAuthGate(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/uploads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  expectStatus(response, 401, "auth gate");
  return "401 unauthorized";
}

async function checkAnonymousUpload(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/uploads`, {
    method: "POST",
    headers: { "content-type": "image/png" },
    body: "smoke-test",
  });
  expectStatus(response, 401, "anonymous upload");
  return "401 unauthorized";
}

async function checkJobsRequireAuth(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/jobs`);
  expectStatus(response, 401, "GET /v1/jobs");
  const body = (await response.json()) as { error?: string };
  if (body.error !== "Missing bearer token") {
    throw new Error(`GET /v1/jobs: expected { error: "Missing bearer token" }, received ${JSON.stringify(body)}`);
  }
  return "401 unauthorized";
}

async function checkApplicationsRequireAuth(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/jobs/smoke-nonexistent/applications`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  expectStatus(response, 401, "POST /v1/jobs/:id/applications");
  return "401 unauthorized";
}

async function checkJobDetailRequiresAuth(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/jobs/smoke-nonexistent`);
  expectStatus(response, 401, "GET /v1/jobs/:id");
  return "401 unauthorized";
}

async function checkMyApplicationsRequireAuth(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/applications`);
  expectStatus(response, 401, "GET /v1/applications");
  return "401 unauthorized";
}

async function checkWithdrawRequiresAuth(): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/applications/smoke-nonexistent/withdraw`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  expectStatus(response, 401, "POST /v1/applications/:id/withdraw");
  return "401 unauthorized";
}

async function main(): Promise<void> {
  console.log(`Running smoke checks against ${baseUrl}`);
  const checks: CheckResult[] = [
    await runCheck("GET /health", checkHealth),
    await runCheck("POST /v1/uploads requires auth", checkAuthGate),
    await runCheck("POST /v1/uploads rejects anonymous uploads", checkAnonymousUpload),
    await runCheck("GET /v1/jobs requires auth", checkJobsRequireAuth),
    await runCheck("GET /v1/jobs/:id requires auth", checkJobDetailRequiresAuth),
    await runCheck("POST /v1/jobs/:id/applications requires auth", checkApplicationsRequireAuth),
    await runCheck("GET /v1/applications requires auth", checkMyApplicationsRequireAuth),
    await runCheck("POST /v1/applications/:id/withdraw requires auth", checkWithdrawRequiresAuth),
  ];

  for (const result of checks) {
    console.log(`${result.ok ? "ok" : "not ok"} - ${result.name} (${result.detail})`);
  }

  if (checks.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
