// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { appendChildren, createElement } from "./dom.ts";

describe("createElement", () => {
  it("creates an element of the given tag with no class or text by default", () => {
    const element = createElement("div");

    expect(element.tagName).toBe("DIV");
    expect(element.className).toBe("");
    expect(element.textContent).toBe("");
  });

  it("sets the class name when provided", () => {
    const element = createElement("p", "my-class");

    expect(element.className).toBe("my-class");
  });

  it("sets the text content when provided", () => {
    const element = createElement("span", undefined, "Hello");

    expect(element.textContent).toBe("Hello");
  });

  it("sets both class name and text content when both are provided", () => {
    const element = createElement("h1", "title", "Construct");

    expect(element.className).toBe("title");
    expect(element.textContent).toBe("Construct");
  });

  it("returns an element typed to the given tag", () => {
    const element = createElement("article", "metric");

    expect(element.tagName).toBe("ARTICLE");
    expect(element.className).toBe("metric");
  });
});

describe("appendChildren", () => {
  it("appends all children to the parent in order", () => {
    const parent = createElement("div");
    const first = createElement("span", undefined, "first");
    const second = createElement("span", undefined, "second");

    appendChildren(parent, [first, second]);

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]?.textContent).toBe("first");
    expect(parent.children[1]?.textContent).toBe("second");
  });

  it("leaves the parent empty when given an empty array", () => {
    const parent = createElement("div");

    appendChildren(parent, []);

    expect(parent.children).toHaveLength(0);
  });

  it("appends new children after existing children", () => {
    const parent = createElement("ul");
    parent.append(createElement("li", undefined, "existing"));

    appendChildren(parent, [createElement("li", undefined, "new")]);

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]?.textContent).toBe("existing");
    expect(parent.children[1]?.textContent).toBe("new");
  });
});
