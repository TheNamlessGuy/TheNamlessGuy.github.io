// Because the <p> tag is designed by absolute mororns
class ParagraphElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
.content {
  margin: 16px 0;
}
`;

    const content = document.createElement('div');
    content.classList.add('content');
    content.innerHTML = this.innerHTML;

    this.attachShadow({mode: 'closed'}).append(style, content);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-paragraph', ParagraphElement));