class CustomFootnoteElement extends HTMLElement {
  static markerID(idx) { return `footnote_text_${idx}`; }
  static _marker(idx, contents) {
    const container = document.createElement('sup');
    container.id = CustomFootnoteElement.markerID(idx);
    container.title = contents; // TODO: This should use a custom tooltip element whenever I get around to making one

    const link = document.createElement('a');
    link.innerText = `[${idx}]`;
    link.href = `#${CustomFootnoteFooterElement.markerID(idx)}`;
    container.append(link);

    return container;
  }

  constructor() {
    super();

    const contents = this.innerHTML;
    this.childNodes.forEach(x => x.remove());

    const idx = CustomFootnoteFooterElement.get().add(contents);
    this.append(CustomFootnoteElement._marker(idx, contents));
  }
}

class CustomFootnoteFooterElement extends HTMLElement {
  static get() {
    const existing = document.getElementsByTagName('c-footnote-footer')[0];
    if (existing) {
      return existing;
    }

    const separator = document.createElement('c-separator');
    if ('faded' in separator) { // CustomSeparatorElement is loaded
      separator.faded();
      document.body.append(separator);
    }

    const created = document.createElement('c-footnote-footer');
    document.body.append(created);

    return created;
  }

  static markerID(idx) { return `footnote_footer_${idx}`; }
  static _marker(idx) {
    const container = document.createElement('sup');
    container.id = CustomFootnoteFooterElement.markerID(idx);

    const link = document.createElement('a');
    link.innerText = `[${idx}]`;
    link.href = `#${CustomFootnoteElement.markerID(idx)}`;
    container.append(link);

    return container;
  }

  add(contents) {
    const idx = this.getElementsByClassName('footnote-footer-content').length + 1;

    const container = document.createElement('div');
    container.classList.add('footnote-footer-content');
    container.style.paddingBottom = '1ch';

    container.append(CustomFootnoteFooterElement._marker(idx));

    const contentElem = document.createElement('span');
    contentElem.style.marginLeft = '1ch';
    contentElem.innerHTML = contents;
    container.append(contentElem);

    this.append(container);

    return idx;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('c-footnote-footer', CustomFootnoteFooterElement);
  customElements.define('c-footnote', CustomFootnoteElement);
});