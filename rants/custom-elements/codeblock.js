class CodeBlockElement extends HTMLElement {
  constructor() {
    super();

    const style = document.createElement('style');
    style.textContent = `
.content {
  background-color: #444;
  padding: 5px 10px;
  margin: 10px 0;
  font-family: monospace;
  color: #AAA;
  border-radius: 3px;
  white-space: pre;
}
`;

    const content = document.createElement('div');
    content.classList.add('content');
    let lines = this.innerHTML.split('\n').slice(1, -1);
    const prefixLength = this._longestPrefixLength(lines.filter(x => x.trim().length > 0));
    lines = lines.map(x => x.substring(prefixLength));
    content.innerHTML = lines.join('<br>');

    // TODO: Syntax highlighting

    this.attachShadow({mode: 'closed'}).append(style, content);
  }

  _longestPrefixLength(lines) {
    // https://stackoverflow.com/a/68705579
    const charList = [];
    const [shortestWord, ...wordList] = [...lines].sort((a, b) => a.length - b.length);

    shortestWord.split('').every((char, idx) => {
      const isValidChar = wordList.every(word => word.charAt(idx) === char);
      if (isValidChar) {
        charList.push(char);
      }

      return isValidChar;
    });

    return charList.length;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('c-codeblock', CodeBlockElement));