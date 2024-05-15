class BaseModal {
  static show(data = null) {
    const container = document.getElementById('modal-container');

    const modal = new this(data);
    container.append(modal.element);

    container.style.display = 'flex';
  }

  element = null;
  constructor() {
    this.element = document.createElement('div');

    this.element.style.backgroundColor = 'var(--bg-color-0)';
    this.element.style.padding = '10px';
    this.element.style.margin = 'auto';
    this.element.style.borderRadius = '5px';
    this.element.style.border = '1px solid var(--separator-color-0)';
    this.element.style.textAlign = 'left';
    this.element.style.maxWidth = '80%';

    this.element.addEventListener('click', (e) => e.stopPropagation());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  function scrollbarWidth() {
    // https://stackoverflow.com/a/28361560
    const tmp = document.createElement('div');
    tmp.style.width = '100px';
    tmp.style.height = '100px';
    tmp.style.overflow = 'scroll';
    tmp.style.position = 'absolute';
    tmp.style.top = '-99999999px';
    document.body.append(tmp);

    const width = tmp.offsetWidth - tmp.clientWidth;
    tmp.remove();
    return width;
  }

  const container = document.createElement('div');
  container.id = 'modal-container';
  container.style.display = 'none';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = `calc(100vw - ${scrollbarWidth()}px)`;
  container.style.height = '100vh';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  container.setAttribute('sticky', '0');

  container.addEventListener('click', () => {
    const sticky = container.getAttribute('sticky') ?? '0';
    if (sticky === '0') {
      container.style.display = 'none';
      while (container.hasChildNodes()) {
        container.childNodes[0].remove();
      }
    }
  });

  document.body.append(container);
});