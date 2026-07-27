class CustomTabsElement extends HTMLElement {
  constructor() {
    super();

    this._injectStyleIfNotInjected();

    const tabContainer = document.createElement('div');
    tabContainer.classList.add('tab-container');

    const tabContentContainer = document.createElement('div');
    tabContentContainer.classList.add('tab-content-container');

    const tabs = Array.from(this.getElementsByTagName('tab'));

    for (let t = 0; t < tabs.length; ++t) {
      const tab = tabs[t];

      const title = tab.getElementsByTagName('title')[0].innerText.trim();
      const body = tab.getElementsByTagName('content')[0].childNodes;

      tab.remove();

      const tabElem = document.createElement('span');
      tabElem.classList.add('tab');
      tabElem.textContent = title;
      tabElem.addEventListener('click', () => this.select(t));
      tabContainer.append(tabElem);

      const tabBody = document.createElement('div');
      tabBody.classList.add('tab-content');
      tabBody.append(...body);
      tabContentContainer.append(tabBody);
    }

    this.append(tabContainer, tabContentContainer);

    const selectedIdx = tabs.findIndex((tab) => tab.hasAttribute('selected'));
    this.select(selectedIdx === -1 ? 0 : selectedIdx);
  }

  /** @param {number} idx */
  select(idx) {
    const tabs = this.querySelectorAll('.tab-container > .tab');
    for (let i = 0; i < tabs.length; ++i) {
      tabs[i].classList.toggle('selected', i === idx);
    }

    const contents = this.querySelectorAll('.tab-content-container > .tab-content');
    for (let i = 0; i < contents.length; ++i) {
      contents[i].classList.toggle('selected', i === idx);
    }
  }

  _injectStyleIfNotInjected() {
    const existing = document.querySelector('style.custom-tabs-element');
    if (existing == null) {
      const style = document.createElement('style');
      style.classList.add('custom-tabs-element');

      style.textContent = `
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
`;

      document.head.append(style);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-tabs', CustomTabsElement));
