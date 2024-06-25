class CustomCodeElement extends HTMLElement {
  constructor() {
    super();

    this.style.whiteSpace = 'pre-wrap';
    this.style.textAlign = 'left';

    let lines = this.innerText.split('\n');
    if (lines[0].trim() === '') { lines.shift(); }
    if (lines[lines.length - 1].trim() === '') { lines.pop(); }
    lines = this._clearCommonWhitespace(lines);

    const language = this.getAttribute('language');

    const style = document.createElement('style');
    style.textContent = `
.content {
  background-color: var(--bg-color-1);
  border: 3px double #FFF;
  padding: 5px;
  margin: 5px;
  color: white;
  font-family: monospace;
  display: block;
  width: fit-content;
}
`;

    let content = null;
    if (this.block) {
      content = document.createElement('div');
    } else {
      content = document.createElement('span');
    }
    content.classList.add('content');
    content.innerText = lines.join('\n');

    this.attachShadow({mode: 'closed'}).append(style, content);
  }

  _getCommonWhitespacePrefixLength(lines) { // https://stackoverflow.com/a/68703218
    const linesToCheck = lines.slice(1).filter(x => x.length > 0);

    let i = 0;
    while (lines[0][i] === ' ' && linesToCheck.every((l) => l[i] === lines[0][i])) {
      i++;
    }

    return i;
  }

  _clearCommonWhitespace(lines) {
    let len = this._getCommonWhitespacePrefixLength(lines);

    for (let i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].substring(len);
    }

    return lines;
  }

  get block() {
    return this.hasAttribute('block');
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-code', CustomCodeElement));