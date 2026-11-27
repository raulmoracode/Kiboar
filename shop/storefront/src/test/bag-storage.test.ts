import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BagItem } from "../components/Bag";
import { loadBag, saveBag } from "../lib/bag-storage";

const STORAGE_KEY = "kiboar.bag.v1";
const store = new Map<string, string>();

const localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
};

const item: BagItem = {
  variantId: "var_1",
  title: "Kiboar 60",
  handle: "kiboar-60",
  thumbnail: null,
  variantTitle: null,
  price: { amount: 19900, currency_code: "eur" },
  quantity: 2,
};

beforeEach(() => {
  store.clear();
  vi.stubGlobal("window", { localStorage });
});

afterEach(() => vi.unstubAllGlobals());

describe("the bag storage", () => {
  it("starts empty", () => {
    expect(loadBag()).toEqual([]);
  });

  it("round-trips a valid bag", () => {
    saveBag([item]);
    expect(loadBag()).toEqual([item]);
  });

  it("ignores malformed JSON", () => {
    store.set(STORAGE_KEY, "{");
    expect(loadBag()).toEqual([]);
  });

  it("drops items that do not match the shape", () => {
    store.set(STORAGE_KEY, JSON.stringify([item, { variantId: "broken" }]));
    expect(loadBag()).toEqual([item]);
  });

  it("does not throw when storage rejects the write", () => {
    vi.stubGlobal("window", {
      localStorage: {
        ...localStorage,
        setItem: () => {
          throw new Error("quota");
        },
      },
    });

    expect(() => saveBag([item])).not.toThrow();
  });
});
