class CustomParagraphElement extends HTMLElement {
  static _insertIndentAfter = [
    'br',
    'ul',
  ];

  constructor() {
    super();

    const element = document.createElement('div');
    element.style.textAlign = 'left';
    element.style.marginBottom = '1.1em';
    element.append(this._indent());

    for (const node of Array.from(this.childNodes)) {
      node.remove();
      element.append(node);

      if (node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'c-code' && node.block) {
          element.append(this._indent());
        } else {
          for (const identifier of CustomParagraphElement._insertIndentAfter) {
            if (tag === identifier) {
              element.append(this._indent());
              break;
            }
          }
        }
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
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-paragraph', CustomParagraphElement));