class LinkContainerElement extends CustomHTMLElement {
  static key = 'c-link-container';
  static style = `
.title {
  font-size: 150%;
  margin-bottom: 15px;
}

.description {
  font-style: italic;
}
`;

  init() {
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

    return [title, description];
  }
}

window.addEventListener('DOMContentLoaded', () => LinkContainerElement.setup());