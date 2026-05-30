// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { appendChildren, createElement } from "../src/ui/dom.ts";

describe("createElement", () => {
  describe("given a tag name with no optional arguments", () => {
    it("when called, then it creates an element of that type with no class or text", () => {
      // Arrange (none)

      // Act
      const element = createElement("div");

      // Assert
      expect(element.tagName).toBe("DIV");
      expect(element.className).toBe("");
      expect(element.textContent).toBe("");
    });
  });

  describe("given a tag name and a class name", () => {
    it("when called, then the element has that class name", () => {
      // Arrange (none)

      // Act
      const element = createElement("p", "my-class");

      // Assert
      expect(element.className).toBe("my-class");
    });
  });

  describe("given a tag name and text content", () => {
    it("when called, then the element has that text content", () => {
      // Arrange (none)

      // Act
      const element = createElement("span", undefined, "Hello");

      // Assert
      expect(element.textContent).toBe("Hello");
    });
  });

  describe("given a tag name, class name, and text content", () => {
    it("when called, then the element has both the class name and the text content", () => {
      // Arrange (none)

      // Act
      const element = createElement("h1", "title", "Construct");

      // Assert
      expect(element.className).toBe("title");
      expect(element.textContent).toBe("Construct");
    });
  });

  describe("given an article tag name", () => {
    it("when called, then it returns an HTMLElement typed to that tag", () => {
      // Arrange (none)

      // Act
      const element = createElement("article", "metric");

      // Assert
      expect(element.tagName).toBe("ARTICLE");
      expect(element.className).toBe("metric");
    });
  });
});

describe("appendChildren", () => {
  describe("given a parent element and multiple children", () => {
    it("when called, then all children are appended to the parent in order", () => {
      // Arrange
      const parent = createElement("div");
      const firstChild = createElement("span", undefined, "first");
      const secondChild = createElement("span", undefined, "second");

      // Act
      appendChildren(parent, [firstChild, secondChild]);

      // Assert
      expect(parent.children).toHaveLength(2);
      expect(parent.children[0]?.textContent).toBe("first");
      expect(parent.children[1]?.textContent).toBe("second");
    });
  });

  describe("given a parent element and an empty array", () => {
    it("when called, then the parent remains empty", () => {
      // Arrange
      const parent = createElement("div");

      // Act
      appendChildren(parent, []);

      // Assert
      expect(parent.children).toHaveLength(0);
    });
  });

  describe("given a parent element already containing a child", () => {
    it("when new children are appended, then existing and new children are all present", () => {
      // Arrange
      const parent = createElement("ul");
      const existingChild = createElement("li", undefined, "existing");
      parent.append(existingChild);
      const newChild = createElement("li", undefined, "new");

      // Act
      appendChildren(parent, [newChild]);

      // Assert
      expect(parent.children).toHaveLength(2);
      expect(parent.children[0]?.textContent).toBe("existing");
      expect(parent.children[1]?.textContent).toBe("new");
    });
  });
});
