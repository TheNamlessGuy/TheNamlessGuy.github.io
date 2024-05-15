class CustomParagraphElement extends HTMLElement {
  constructor() {
    super();

    const element = document.createElement('div');
    element.style.textAlign = 'left';
    element.style.marginBottom = '1.1em';
    element.append(this._indent());

    for (const node of Array.from(this.childNodes)) {
      node.remove();
      element.append(node);

      if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'br') {
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
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-paragraph', CustomParagraphElement));