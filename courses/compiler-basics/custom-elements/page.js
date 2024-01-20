class PageElement extends HTMLElement {
  constructor() {
    super();

    const container = document.createElement('div');
    container.classList.add('container');

    const lhs = document.createElement('div');
    lhs.appendChild(document.createElement('sidebar-content'));
    container.appendChild(lhs);

    const center = document.createElement('div');
    center.classList.add('center');
    center.innerHTML = this.innerHTML;
    container.appendChild(center);

    const rhs = document.createElement('div');
    container.appendChild(rhs);

    const style = document.createElement('style');
    style.textContent = `
.container {
  display: flex;
  background-color: #000;
}

.container > div {
  flex-grow: 1;
  height: 100%;
  color: #FFF;
}

.center {
  width: 60vw;
  background-color: #333;
}

.center > h1,
.center > h2,
.center > h3 {
  text-align: center;
}

.center > p {
  margin: 16px auto;
  max-width: 85%;
}
`;
    container.appendChild(style);

    this.innerHTML = '';
    this.appendChild(container);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('page-element', PageElement));