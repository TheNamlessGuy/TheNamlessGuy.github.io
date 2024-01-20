class LinkListElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
a {
  text-decoration: none;
  font-size: 150%;
}
`;

    // https://stackoverflow.com/a/55387306
    const children = [].concat(...Array.from(this.children).map(x => [x, document.createElement('br')]));
    this.attachShadow({mode: 'closed'}).append(style, ...children);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-link-list', LinkListElement));