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

async function main(): Promise<void> {
  console.log(`Running smoke checks against ${baseUrl}`);
  const checks: CheckResult[] = [
    await runCheck("GET /health", checkHealth),
    await runCheck("POST /v1/uploads requires auth", checkAuthGate),
    await runCheck("POST /v1/uploads rejects anonymous uploads", checkAnonymousUpload),
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
