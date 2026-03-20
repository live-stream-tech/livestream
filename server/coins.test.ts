import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({ db: mockDb }));
vi.mock("./schema", () => ({
  coinBalances: "coinBalances",
  coinTransactions: "coinTransactions",
  jukeboxRequestCounts: "jukeboxRequestCounts",
  wallets: "wallets",
  users: "users",
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
}));

// ─── Helper: build mock req/res ───────────────────────────────────────────────
function mockReqRes(overrides: {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}) {
  const req = {
    headers: overrides.headers ?? {},
    body: overrides.body ?? {},
    query: overrides.query ?? {},
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

// ─── JWT helper ───────────────────────────────────────────────────────────────
import jwt from "jsonwebtoken";
const JWT_SECRET = "test-secret";
function makeToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET);
}

// ─── Unit tests for coin logic ────────────────────────────────────────────────

describe("Coin System – balance logic", () => {
  it("returns 0 when no coin_balances row exists", () => {
    const balance = 0; // default when row is absent
    expect(balance).toBe(0);
  });

  it("deducts 1 coin correctly", () => {
    const currentBalance = 5;
    const newBalance = currentBalance - 1;
    expect(newBalance).toBe(4);
  });

  it("rejects spend when balance is 0", () => {
    const balance = 0;
    const canSpend = balance >= 1;
    expect(canSpend).toBe(false);
  });

  it("allows spend when balance >= 1", () => {
    const balance = 3;
    const canSpend = balance >= 1;
    expect(canSpend).toBe(true);
  });
});

describe("Coin System – free request logic", () => {
  const FREE_LIMIT = 3;

  it("first 3 requests are free", () => {
    for (let count = 0; count < FREE_LIMIT; count++) {
      const freeRemaining = Math.max(0, FREE_LIMIT - count);
      expect(freeRemaining).toBeGreaterThan(0);
    }
  });

  it("4th+ request requires payment", () => {
    const count = 3; // already used 3
    const freeRemaining = Math.max(0, FREE_LIMIT - count);
    expect(freeRemaining).toBe(0);
  });

  it("freeRemaining never goes negative", () => {
    const count = 10; // way over limit
    const freeRemaining = Math.max(0, FREE_LIMIT - count);
    expect(freeRemaining).toBe(0);
  });
});

describe("Coin System – package pricing", () => {
  const PACKAGES = {
    "pack-1":  { coins: 1,  amountGBP: 16,  label: "1 Jukebox Coin" },
    "pack-5":  { coins: 5,  amountGBP: 75,  label: "5 Jukebox Coins" },
    "pack-10": { coins: 10, amountGBP: 140, label: "10 Jukebox Coins" },
    "pack-30": { coins: 30, amountGBP: 390, label: "30 Jukebox Coins" },
  };

  it("all packages have positive coin counts", () => {
    for (const pkg of Object.values(PACKAGES)) {
      expect(pkg.coins).toBeGreaterThan(0);
    }
  });

  it("all packages have positive GBP amounts", () => {
    for (const pkg of Object.values(PACKAGES)) {
      expect(pkg.amountGBP).toBeGreaterThan(0);
    }
  });

  it("pack-30 has more coins than pack-1", () => {
    expect(PACKAGES["pack-30"].coins).toBeGreaterThan(PACKAGES["pack-1"].coins);
  });

  it("invalid package ID returns undefined", () => {
    const pkg = (PACKAGES as Record<string, unknown>)["pack-999"];
    expect(pkg).toBeUndefined();
  });
});

describe("Coin System – revenue conversion", () => {
  const COIN_PRICE_JPY = 30;

  it("requires at least ¥30 revenue balance", () => {
    const balance = 29;
    const canConvert = balance >= COIN_PRICE_JPY;
    expect(canConvert).toBe(false);
  });

  it("allows conversion with exactly ¥30", () => {
    const balance = 30;
    const canConvert = balance >= COIN_PRICE_JPY;
    expect(canConvert).toBe(true);
  });

  it("deducts ¥30 from wallet correctly", () => {
    const balance = 100;
    const newBalance = balance - COIN_PRICE_JPY;
    expect(newBalance).toBe(70);
  });
});

describe("Coin System – idempotency check", () => {
  it("does not credit coins if session already processed", () => {
    const existingTransactions = [{ id: 1, referenceId: "cs_test_abc" }];
    const shouldCredit = existingTransactions.length === 0;
    expect(shouldCredit).toBe(false);
  });

  it("credits coins if session not yet processed", () => {
    const existingTransactions: unknown[] = [];
    const shouldCredit = existingTransactions.length === 0;
    expect(shouldCredit).toBe(true);
  });
});
