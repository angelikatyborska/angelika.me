import { expect, test, describe } from "vitest";
import { reformatDateInId, prepareTags } from "@lib/posts.ts";

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

describe("prepareTags", () => {
  test("slugifies tag", () => {
    expect(prepareTags([])).toEqual([]);
    expect(prepareTags(["Foo Bar"])).toEqual([{ tag: "foo-bar", tagTitle: "Foo Bar" }]);

    expect(prepareTags(["UI/UX"])).toEqual([{ tag: "ui-ux", tagTitle: "UI/UX" }]);

    expect(prepareTags(["Foo Bar", "Bar", "Foo Bar Baz"])).toEqual([
      { tag: "foo-bar", tagTitle: "Foo Bar" },
      { tag: "bar", tagTitle: "Bar" },
      { tag: "foo-bar-baz", tagTitle: "Foo Bar Baz" },
    ]);
  });

  test("removes duplicates, using the first instance as the title", () => {
    expect(prepareTags([])).toEqual([]);

    expect(prepareTags(["Foo Bar", "foo Bar", "foo bar", "foo-bar"])).toEqual([
      { tag: "foo-bar", tagTitle: "Foo Bar" },
    ]);

    expect(prepareTags(["Foo-Bar", "foo Bar", "foo bar", "foo-bar"])).toEqual([
      { tag: "foo-bar", tagTitle: "Foo-Bar" },
    ]);

    expect(prepareTags(["Baz", "Foo-Bar", "foo Bar", "foo bar", "foo-bar", "baz"])).toEqual([
      { tag: "baz", tagTitle: "Baz" },
      { tag: "foo-bar", tagTitle: "Foo-Bar" },
    ]);
  });
});
