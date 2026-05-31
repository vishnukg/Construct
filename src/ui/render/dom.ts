export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

export const appendChildren = (
  parent: HTMLElement,
  children: Array<HTMLElement | SVGElement>,
): void => {
  for (const child of children) {
    parent.append(child);
  }
};
