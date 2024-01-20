class RantElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
a { text-decoration: none; }
h2 { font-style: italic; }
h3 { text-decoration: underline; }
`;

    Array.from(this.children).forEach((paragraph) => {
      if (paragraph.tagName !== 'C-PARAGRAPH') {
        return;
      }

      Array.from(paragraph.children).forEach((div) => {
        if (div.tagName === 'DIV') {
          div.innerHTML = `<span style="white-space: pre;">  </span>${div.innerHTML.trim()}`;
        }
      });
    });

    this.attachShadow({mode: 'closed'}).append(style, ...this.children);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-rant', RantElement));