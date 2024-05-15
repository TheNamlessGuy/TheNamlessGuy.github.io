class CustomSeparatorElement extends CustomHTMLElement {
  static key = 'c-separator';
  static style = `
div {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
}

div::before,
div::after {
  content: '';
  flex-grow: 1;
  border-bottom: 1px solid;
}

div:not(:empty)::before { margin-right: 10px; }
div:not(:empty)::after { margin-left: 10px; }

div.primary::before, div.primary::after { border-color: var(--separator-color-0); }
div.faded::before, div.faded::after { border-color: var(--separator-color-1); }
`;

  init() {
    const element = document.createElement('div');
    while (this.hasChildNodes()) {
      const node = this.childNodes[0];
      node.remove();

      if (node.nodeType === Node.TEXT_NODE) {
        const span = document.createElement('span');
        span.classList.add('whitespace-pre');
        span.innerText = node.textContent;
        element.append(span);
      } else {
        element.append(node);
      }
    }

    if (this.hasAttribute('faded')) {
      element.classList.add('faded');
    } else {
      element.classList.add('primary');
    }

    return [element];
  }
}

window.addEventListener('DOMContentLoaded', () => CustomSeparatorElement.setup());