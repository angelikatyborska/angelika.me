import { expect, test, describe } from "vitest";
import { reformatDateInId } from "../../src/lib/posts.ts";

describe("reformatDateInId", () => {
  test("returns random strings unchanged", () => {
    expect(reformatDateInId("")).toBe("");
    expect(reformatDateInId("abc")).toBe("abc");
    expect(reformatDateInId("1234")).toBe("1234");
  });

  test("changes date separator from dash to slash", () => {
    expect(reformatDateInId("2016-09-01-first-blog-post")).toBe("2016/09/01/first-blog-post");
    expect(reformatDateInId("1993-11-11-only-2-more-months")).toBe("1993/11/11/only-2-more-months");
  });

  test("leaves further dates in post title unchanged", () => {
    expect(reformatDateInId("2020-03-24-2023-01-01-will-be-wild")).toBe(
      "2020/03/24/2023-01-01-will-be-wild",
    );
  });
});
