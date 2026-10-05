import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cleanin-request-access";
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

type RequestAccessPayload = {
  requestId: string;
  customerId: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.REQUEST_ACCESS_SECRET;

  if (!secret) {
    throw new Error("REQUEST_ACCESS_SECRET is not configured.");
  }

  return secret;
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createRequestAccessToken(
  requestId: string,
  customerId: string,
) {
  const payload: RequestAccessPayload = {
    requestId,
    customerId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyRequestAccessToken(
  token: string,
): RequestAccessPayload | null {
  try {
    const [encodedPayload, providedSignature] = token.split(".");

    if (!encodedPayload || !providedSignature) {
      return null;
    }

    const expectedSignature = sign(encodedPayload);

    const provided = Buffer.from(providedSignature);
    const expected = Buffer.from(expectedSignature);

    if (provided.length !== expected.length) {
      return null;
    }

    if (!timingSafeEqual(provided, expected)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as RequestAccessPayload;

    if (
      !payload.requestId ||
      !payload.customerId ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export {
  COOKIE_NAME as REQUEST_ACCESS_COOKIE_NAME,
  TOKEN_TTL_SECONDS as REQUEST_ACCESS_TOKEN_TTL,
};
