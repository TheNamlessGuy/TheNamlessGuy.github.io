import { genericStylesheet } from '../generic-stylesheet.mjs';
import { CustomSeparatorElement } from './separator.mjs';

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
div.accordion-container {
  border: 1px solid var(--separator-color-0);
  border-radius: 5px;
  background-color: var(--bg-color-1);
  overflow: hidden;
}
div.accordion-container.primary { border-color: var(--separator-color-0); }
div.accordion-container.faded { border-color: var(--separator-color-1); }

div.accordion-container > details > summary {
  text-align: left;
  background-color: var(--bg-color-2);
  padding: 5px;
  cursor: pointer;
  user-select: none;
}

div.accordion-container > details > div {
  text-align: left;
  margin: 5px;
}
`);

export class CustomAccordionElement extends HTMLElement {
  /**
   * @param {object} options
   * @param {'faded'|'primary'} [options.intensity]
   */
  constructor(options = {}) {
    super();

    this._elements.container = document.createElement('div');
    this._elements.container.classList.add('accordion-container');

    const sections = Array.from(this.getElementsByTagName('section'));
    for (const section of sections) {
      section.remove();

      const id = section.id;
      const title = section.title;
      const contents = Array.from(section.childNodes);

      this.addSection(id, title, contents);

      if (section.hasAttribute('expanded')) {
        this.toggle(id, {forcedState: 'open'});
      }
    }

    if (this.hasAttribute('faded') || options.intensity === 'faded') {
      this.faded();
    } else { // this.hasAttribute('primary') || options.intensity === 'primary' || none defined
      this.primary();
    }

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.adoptedStyleSheets = [genericStylesheet, stylesheet];
    shadow.append(this._elements.container);
  }

  /**
   * @param {string} id
   * @param {string} title
   * @param {Node[]} contents
   */
  addSection(id, title, contents) {
    if (this._elements.details().length > 0) {
      this._elements.container.append(new CustomSeparatorElement({intensity: 'faded', size: 'sizeless'}));
    }

    const details = document.createElement('details');
    details.dataset.id = id;

    const summary = document.createElement('summary');
    summary.textContent = title;
    details.append(summary);

    const contentsElem = document.createElement('div');
    contentsElem.append(...contents);
    details.append(contentsElem);

    this._elements.container.append(details);
  }

  /**
   * @param {string} id
   *
   * @param {object} extras
   * @param {'open'|'closed'|null} [extras.forcedState]
   */
  toggle(id, extras = {}) {
    const details = this._elements.details();
    for (const detail of details) {
      if (detail.dataset.id === id) {
        if (extras.forcedState == null) {
          detail.open = !detail.open;
        } else {
          detail.open = (extras.forcedState === 'open');
        }

        break;
      }
    }
  }

  /** @param {string} id */
  open(id) { this.toggle(id, {forcedState: 'open'}); }
  /** @param {string} id */
  close(id) { this.toggle(id, {forcedState: 'closed'}); }

  faded() {
    this._elements.container.classList.remove('primary');
    this._elements.container.classList.add('faded');
  }

  primary() {
    this._elements.container.classList.remove('faded');
    this._elements.container.classList.add('primary');
  }

  _elements = {
    /** @type {HTMLDivElement} */
    container: null,

    details: () => Array.from(this._elements.container.getElementsByTagName('details')),
  }
}

onDOMContentLoaded(() => customElements.define('c-accordion', CustomAccordionElement));
