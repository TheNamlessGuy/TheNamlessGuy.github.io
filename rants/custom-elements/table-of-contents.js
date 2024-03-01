class TableOfContentsElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
a {
  text-decoration: none;
}
`;

    const links = []; // TODO
    this.attachShadow({mode: 'closed'}).append(style, ...links);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-table-of-contents', TableOfContentsElement));