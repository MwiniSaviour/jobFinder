import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";

const { uploadMock } = vi.hoisted(() => ({ uploadMock: vi.fn() }));

vi.mock("cloudinary", () => ({
  v2: { uploader: { upload: uploadMock } },
}));

const userApi = { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() };

vi.mock("../src/db.js", () => ({
  getPrisma: vi.fn(),
  closePrisma: vi.fn(),
}));

import { getPrisma } from "../src/db.js";
import { app } from "../src/app.js";

const ISSUER = "https://clerk.test";
const userRow = {
  id: "u1",
  clerkUserId: "user_clerk1",
  name: null,
  email: "ada@example.com",
  emailVerified: null,
  image: null,
  passwordHash: null,
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

let signingKeyPair: ReturnType<typeof generateKeyPairSync>;

async function makeToken(claims: JWTPayload): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .sign(signingKeyPair.privateKey);
}

const stub = { user: userApi } as unknown as ReturnType<typeof getPrisma>;

function upload(body: Uint8Array | undefined, headers: Record<string, string>) {
  return app.request("/v1/uploads", { method: "POST", headers, body });
}

beforeEach(async () => {
  signingKeyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  vi.stubEnv("CLERK_ISSUER_URL", ISSUER);
  const jwk = {
    ...(await exportJWK(signingKeyPair.publicKey)),
    kid: "test-key",
    alg: "RS256",
    use: "sig",
  };
  vi.stubEnv("CLERK_JWKS_JSON", JSON.stringify({ keys: [jwk] }));
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
  vi.stubEnv("CLOUDINARY_API_KEY", "");
  vi.stubEnv("CLOUDINARY_API_SECRET", "");
  vi.stubGlobal("fetch", vi.fn());
  vi.mocked(getPrisma).mockReturnValue(stub);
  userApi.findUnique.mockReset();
  userApi.findUnique.mockResolvedValue(userRow);
  uploadMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /v1/uploads", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await upload(new Uint8Array([1, 2, 3]), { "content-type": "image/png" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 415 when the content type is not an image", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "text/plain",
    });

    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: "Unsupported media type" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 415 for image types outside the allowlist", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "image/svg+xml",
    });

    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: "Unsupported media type" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns 415 for an image type with a lookalike subtype", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "image/png.exe",
    });

    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: "Unsupported media type" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("accepts each allowed image type", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    uploadMock.mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/x.png" });
    const token = await makeToken({ sub: "user_clerk1" });

    for (const contentType of ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]) {
      uploadMock.mockClear();
      const res = await upload(new Uint8Array([1, 2, 3]), {
        authorization: `Bearer ${token}`,
        "content-type": contentType,
      });

      expect(res.status).toBe(200);
      expect(uploadMock).toHaveBeenCalledTimes(1);
    }
  });

  it("returns 503 when cloudinary is not configured", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "image/png",
    });

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Uploads are not configured" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("uploads an image and returns the secure url", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    uploadMock.mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/image/upload/jobfinder/x.png" });
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "image/png",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/jobfinder/x.png",
    });
    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [dataUri, options] = uploadMock.mock.calls[0];
    expect(dataUri).toBe(`data:image/png;base64,${Buffer.from([1, 2, 3]).toString("base64")}`);
    expect(options).toMatchObject({
      cloud_name: "demo",
      api_key: "key",
      api_secret: "secret",
      folder: "jobfinder",
      resource_type: "image",
    });
  });

  it("returns 502 when cloudinary rejects the upload", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    uploadMock.mockRejectedValue(new Error("boom"));
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await upload(new Uint8Array([1, 2, 3]), {
      authorization: `Bearer ${token}`,
      "content-type": "image/png",
    });

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Upload failed" });
  });

  it("accepts uploads larger than the standard body limit up to the upload cap", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    uploadMock.mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/x.png" });
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/uploads", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "image/png",
        "content-length": "500000",
      },
      body: new Uint8Array([1, 2, 3]),
    });

    expect(res.status).toBe(200);
  });
});
