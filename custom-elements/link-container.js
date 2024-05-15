class LinkContainerElement extends HTMLElement {
  constructor() {
    super();

    const titleElem = this.getElementsByTagName('title')[0];
    const descriptionElem = this.getElementsByTagName('description')[0];

    let title = null;
    const url = titleElem.getAttribute('url') ?? null;
    if (url) {
      title = document.createElement('a');
      title.href = url;
    } else {
      title = document.createElement('div');
    }
    title.innerText = titleElem.innerText;
    title.classList.add('title');

    const description = document.createElement('div');
    description.classList.add('description');
    description.append(...descriptionElem.childNodes);

    const style = document.createElement('style');
    style.textContent = `
@import url("/generic.css");

.title {
  font-size: 150%;
  margin-bottom: 15px;
}

.description {
  font-style: italic;
}
`;

    this.attachShadow({mode: 'closed'}).append(style, title, description);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-link-container', LinkContainerElement));