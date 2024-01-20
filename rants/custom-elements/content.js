class ContentElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
.wrapper {
  margin: auto;
  max-width: 60vw;
  display: flex;
  justify-content: center;
}
`;

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    const content = document.createElement('div');
    content.innerHTML = this.innerHTML;
    wrapper.appendChild(content);

    this.attachShadow({mode: 'closed'}).append(style, wrapper);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-content', ContentElement));