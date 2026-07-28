const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
c-tabs div.tab-container { display: flex; }
c-tabs div.tab-content-container {
  padding: 5px;
  padding-top: 15px;
  border: 1px solid var(--separator-color-0);
  border-radius: 0 0 5px 5px;
}

c-tabs div.tab-container > .tab {
  color: var(--text-color-1);
  border: 1px solid var(--separator-color-1);
  border-bottom: 0;
  padding: 5px;
  user-select: none;
  cursor: pointer;
  flex-grow: 1;
}
c-tabs div.tab-container > .tab.selected {
  color: var(--text-color-0);
  border-color: var(--separator-color-0);
  cursor: default;
  position: relative;
  z-index: 1;
  margin-bottom: -1px;
  background: var(--bg-color-0);
}
c-tabs div.tab-container > .tab:first-child { border-radius: 5px 0 0 0; }
c-tabs div.tab-container > .tab:last-child { border-radius: 0 5px 0 0; }

c-tabs div.tab-content-container > .tab-content { display: none; }
c-tabs div.tab-content-container > .tab-content.selected { display: revert; }
`);

export class CustomTabsElement extends HTMLElement {
  constructor() {
    super();

    this._elements.tabContainer = document.createElement('div');
    this._elements.tabContainer.classList.add('tab-container');
    this.append(this._elements.tabContainer);

    this._elements.tabContentContainer = document.createElement('div');
    this._elements.tabContentContainer.classList.add('tab-content-container');
    this.append(this._elements.tabContentContainer);

    /** @type {string} */
    let selected = null;
    const tabs = /** @type {HTMLElement[]} */ (Array.from(this.getElementsByTagName('tab')));
    for (const tab of tabs) {
      tab.remove();

      const id = tab.id;
      const title = tab.title;
      const body = Array.from(tab.childNodes);

      this.addTab(id, title, body);

      if (selected == null || tab.hasAttribute('selected')) {
        selected = id;
      }
    }

    this.select(selected);
  }

  /** @param {string} id */
  select(id) {
    const tabs = this._elements.tabs();
    for (let i = 0; i < tabs.length; ++i) {
      tabs[i].classList.toggle('selected', tabs[i].dataset.id === id);
    }

    const contents = this._elements.contents();
    for (let i = 0; i < contents.length; ++i) {
      contents[i].classList.toggle('selected', tabs[i].dataset.id === id);
    }
  }

  /** @returns {string} */
  getCurrentTab() {
    const tabs = this._elements.tabs();
    const selected = /** @type {HTMLSpanElement} */ (tabs.find((tab) => tab.classList.contains('selected')));
    return /** @type {string} */ (selected.dataset.id);
  }

  /**
   * @param {string} id
   * @param {string} title
   * @param {Node[]} body
   */
  addTab(id, title, body) {
    const tabElem = document.createElement('span');
    tabElem.classList.add('tab');
    tabElem.textContent = title;
    tabElem.addEventListener('click', () => this.select(id));
    this._elements.tabContainer.append(tabElem);

    tabElem.dataset.id = id;

    const tabBody = document.createElement('div');
    tabBody.classList.add('tab-content');
    tabBody.append(...body);
    this._elements.tabContentContainer.append(tabBody);
  }

  connectedCallback() {
    this._injectStyleIfNotInjected();
  }

  _elements = {
    /** @type {HTMLDivElement} */
    tabContainer: null,

    /** @type {HTMLDivElement} */
    tabContentContainer: null,

    tabs: () => /** @type {HTMLSpanElement[]} */ (Array.from(this._elements.tabContainer.children)),
    contents: () => /** @type {HTMLDivElement[]} */ (Array.from(this._elements.tabContentContainer.children)),
  };

  _injectStyleIfNotInjected() {
    const root = /** @type {Document|ShadowRoot|CustomTabsElement} */ (this.getRootNode({composed: false}));

    if (root instanceof CustomTabsElement) {
      return; // Not connected to the DOM yet
    }

    if (!root.adoptedStyleSheets.includes(stylesheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, stylesheet];
    }
  }
}

onDOMContentLoaded(() => customElements.define('c-tabs', CustomTabsElement));
