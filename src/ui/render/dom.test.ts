// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { appendChildren, createElement } from "./dom.ts";

describe("createElement", () => {
  it("given no optional arguments, creates an element with no class or text", () => {
    const element = createElement("div");

    expect(element.tagName).toBe("DIV");
    expect(element.className).toBe("");
    expect(element.textContent).toBe("");
  });

  it("given a class name, sets the class name on the element", () => {
    const element = createElement("p", "my-class");

    expect(element.className).toBe("my-class");
  });

  it("given text content, sets the text content on the element", () => {
    const element = createElement("span", undefined, "Hello");

    expect(element.textContent).toBe("Hello");
  });

  it("given a class name and text content, sets both on the element", () => {
    const element = createElement("h1", "title", "Construct");

    expect(element.className).toBe("title");
    expect(element.textContent).toBe("Construct");
  });

  it("given a specific tag, returns an element typed to that tag", () => {
    const element = createElement("article", "metric");

    expect(element.tagName).toBe("ARTICLE");
    expect(element.className).toBe("metric");
  });
});

describe("appendChildren", () => {
  it("given multiple children, appends all to the parent in order", () => {
    const parent = createElement("div");
    const first = createElement("span", undefined, "first");
    const second = createElement("span", undefined, "second");

    appendChildren(parent, [first, second]);

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]?.textContent).toBe("first");
    expect(parent.children[1]?.textContent).toBe("second");
  });

  it("given an empty array, leaves the parent empty", () => {
    const parent = createElement("div");

    appendChildren(parent, []);

    expect(parent.children).toHaveLength(0);
  });

  it("given a parent with existing children, appends new children after them", () => {
    const parent = createElement("ul");
    parent.append(createElement("li", undefined, "existing"));

    appendChildren(parent, [createElement("li", undefined, "new")]);

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]?.textContent).toBe("existing");
    expect(parent.children[1]?.textContent).toBe("new");
  });
});
