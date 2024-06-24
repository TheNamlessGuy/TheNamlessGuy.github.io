class CustomFootnoteElement extends HTMLElement {
  constructor() {
    super();

    const container = this.getFootnoteContainer();
    const key = Array.from(container.getElementsByClassName('footnote')).length + 1;

    const link = document.createElement('a');
    link.innerHTML = `<sup>${key}</sup>`;
    link.href = `#footnote-${link.innerText}`;

    this.addFootnoteTo(container, key);
    this.title = this.innerHTML;

    const style = document.createElement('style');
    style.textContent = `
a {
  font-size: 12px;
  color: var(--text-color-0);
  text-decoration: none;
}
`;

    this.attachShadow({mode: 'closed'}).append(style, link);
  }

  getFootnoteContainer() {
    let container = document.getElementById('footnote-container');
    if (container == null) {
      container = document.createElement('div');
      container.id = 'footnote-container';
      document.body.append(container);

      const style = document.createElement('style');
      style.textContent = `
#footnote-container {
  border-top: 1px solid var(--separator-color-1);
  padding-top: 5px;
  text-align: left;
  font-size: 12px;
}
`;
      document.head.append(style);
    }
    return container;
  }

  addFootnoteTo(container, key, text = null) {
    const note = document.createElement('div');
    note.id = `footnote-${key}`;
    note.classList.add('footnote');
    note.innerText = `${key}. ${this.innerText}`;
    container.append(note);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-footnote', CustomFootnoteElement));