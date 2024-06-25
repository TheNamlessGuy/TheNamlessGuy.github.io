class CustomParagraphElement extends HTMLElement {
  static _insertIndentAfter = [
    'br',
    'ul',
    'details',
  ];

  constructor() {
    super();

    const element = document.createElement('div');
    element.style.textAlign = 'left';
    element.style.marginBottom = '1.1em';
    element.append(this._indent());

    for (const node of Array.from(this.childNodes)) {
      const shouldIndentAfter = this._shouldIndentAfter(node);

      node.remove();
      element.append(node);
      if (shouldIndentAfter) {
        element.append(this._indent());
      }
    }

    const style = document.createElement('style');
    style.textContent = '@import url("/generic.css");';

    this.attachShadow({mode: 'closed'}).append(style, element);
  }

  _indent() {
    const indent = document.createElement('span');
    indent.style.whiteSpace = 'pre';
    indent.innerText = '  ';
    return indent;
  }

  _shouldIndentAfter(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    // Find the next non-empty text node sibling, and check if we'll indent after that. If we are, we shouldn't indent after this
    let nextNode = node.nextSibling;
    while (nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent.trim().length === 0) {
      nextNode = nextNode.nextSibling;
    }
    if (nextNode && this._shouldIndentAfter(nextNode)) {
      return false;
    }

    const tag = node.tagName.toLowerCase();
    if (tag === 'c-code') {
      return node.block;
    }

    for (const identifier of CustomParagraphElement._insertIndentAfter) {
      if (tag === identifier) {
        return true;
      }
    }

    return false;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-paragraph', CustomParagraphElement));