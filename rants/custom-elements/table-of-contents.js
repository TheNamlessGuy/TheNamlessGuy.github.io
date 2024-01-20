class TableOfContentsElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
a {
  text-decoration: none;
}
`;

    // Array.from(this.children).forEach((paragraph) => {
    //   if (paragraph.tagName !== 'P') {
    //     return;
    //   }

    //   paragraph.replaceChildren(...[].concat(...Array.from(paragraph.children).map((span) => {
    //     if (span.tagName !== 'SPAN') {
    //       return [span];
    //     }

    //     const indent = document.createElement('span');
    //     indent.innerText = ' ';
    //     indent.style.whiteSpace = 'pre';
    //     span.insertBefore(indent, span.firstChild);
    //     return [span, document.createElement('br')];
    //   })));
    // });

    const links = [];
    this.attachShadow({mode: 'closed'}).append(style, ...links);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-table-of-contents', TableOfContentsElement));