class CodeElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
.content {
  background-color: #444;
  color: #AAA;
  font-family: monospace;
  white-space: pre;
  border-radius: 3px;
  padding: 1px 2px;
  margin: 2px 0;
}
`;

    const content = document.createElement('span');
    content.classList.add('content');
    content.innerHTML = this.innerHTML;

    this.attachShadow({mode: 'closed'}).append(style, content);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-code', CodeElement));