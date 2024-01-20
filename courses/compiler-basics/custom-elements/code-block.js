class CodeBlockElement extends HTMLElement {
  _container;
  _style;
  _title;
  _spinner;

  constructor() {
    super();

    this._container = document.createElement('fieldset');

    this._style = document.createElement('style');
    this._style.textContent = `
fieldset {
  display: block;
  background-color: #222;
  border: 3px double #FFF;
  padding: 5px;
  margin: 5px;
  color: white;
  white-space: pre;
  font-family: monospace;
}

fieldset > legend {
  font-size: 15px;
  font-style: italic;
}

img {
  width: 10px;
  height: 10px;
}

fieldset > span.magenta { color: #F0F; }
fieldset > span.green { color: #00B300; }
fieldset > span.blue { color: #6767FF; }
fieldset > span.lightblue { color: #7FFFD4; }
fieldset > span.gray { color: #AAA; }
fieldset > span.red { color: #F00; }
fieldset > span.yellow { color: #FF0; }
fieldset > span.orange { color: #FFA500; }
`;

    this._title = null;
    if (this.hasAttribute('title')) {
      this._title = document.createElement('legend');
      this._title.innerText = this.getAttribute('title');
      this._container.appendChild(this._title);
    }

    this._spinner = document.createElement('img');
    this._spinner.src = '../img/loading.gif';
    this._container.appendChild(this._spinner);

    const shadow = this.attachShadow({mode: 'closed'});
    shadow.appendChild(this._style);
    shadow.appendChild(this._container);

    void this._format();
  }

  async _format() {
    let content = null;
    let language = null;
    if (this.hasAttribute('snippet')) {
      content = this.getAttribute('snippet');
      language = content.split('.').pop();
      content = await this._read(content);
    } else if (this.hasAttribute('function')) {
      language = this.getAttribute('language');
      content = functions[this.getAttribute('function')].toString().split('\n');
      content = content.slice(1, content.length - 1);
      const prefix = this._commonPrefixLength(content) - 2;
      content = content.map(c => c.substring(prefix));
      content = [`function ${this.getAttribute('name')}() {`].concat(content, [`}`]).join('\n');
    }

    this._container.innerHTML = this.formatters[language](content);
    if (this._title != null) {
      this._container.insertBefore(this._title, this._container.firstChild);
    }
  }

  async _read(snippet) {
    const reader = (await fetch(`snippets/${snippet}`)).body.getReader();
    return new TextDecoder('utf-8').decode((await reader.read()).value);
  }

  formatters = {
    bnf: (content) => {
      return this._highlight(content, {
        magenta: ['<', '>'],
        blue: ['::='],
        red: [{start: '/', end: '/'}],
        gray: [{start: '#', end: '\n', consume: false}],
      });
    },

    js: (content) => {
      return this._highlight(content, {
          magenta: ['{', '}', '[', ']'],
          blue: ['const', 'let', 'while', 'if', 'else', 'continue', 'null', 'throw', 'new', 'function'],
          yellow: ['(', ')'],
          orange: ['parseInt', 'document'],
          lightblue: [{start: /\d/, end: /[^\d]/, consume: false}],
          green: [{start: "'", end: "'"}, {start: '"', end: '"'}, {start: '`', end: '`'}],
          gray: [{start: '//', end: '\n', consume: false}],
          red: [{start: '/', end: '/'}],
          _: ['stringify'],
      });
    },

    html: (content) => {
      return this._highlight(content, {
        magenta: ['<', '>', '/'],
        green: [{start: '"', end: '"'}],
        blue: ['input', 'button', 'div'],
      });
    },
  }

  _highlight(text, data) {let tokens = [];
    let buffer = '';
    let parsing = null;
    let color = null;

    let i = 0;
    while (i < text.length) {
      let found = false;

      if (parsing != null) {
        if (this._match(text, i, parsing.end)) {
          if (parsing.consume ?? true) {
            buffer += text[i];
            i += 1;
          }

          tokens.push({color: color, value: buffer});
          parsing = null;
          color = null;
          buffer = '';
        } else {
          buffer += text[i];
          i += 1;
        }

        continue;
      }

      for (const col of Object.keys(data)) {
        for (const parseable of data[col]) {
          if (this._isObject(parseable)) {
            if (this._match(text, i, parseable.start)) {
              found = true;
              if (buffer.length > 0) { tokens.push({color: null, value: buffer}); }
              parsing = parseable;
              buffer = text[i];
              color = col;
              i += 1;
              break;
            }
          } else if (this._match(text, i, parseable)) {
            found = true;
            if (buffer.length > 0) { tokens.push({color: null, value: buffer}); }
            buffer = '';
            tokens.push({color: col, value: text.slice(i, i + parseable.length)});
            i += parseable.length;
            break;
          }
        }

        if (found) { break; }
      }

      if (found) { continue; }

      buffer += text[i];

      i += 1;
    }

    if (buffer.length > 0) {
      tokens.push({color: color, value: buffer});
    }

    let result = '';
    for (const token of tokens) {
      if (token.color == null) {
        result += token.value === '\n' ? '<br>' : token.value;
      } else {
        result += `<span class="${token.color}">${token.value}</span>`;
      }
    }

    return result;
  }

  _isObject(val) {
    return typeof val === 'object' && !Array.isArray(val) && val != null;
  }

  _match(text, i, token) {
    if (token instanceof RegExp) {
      return !!text[i].match(token);
    }

    return text.slice(i, i + token.length) === token;
  }

  _commonPrefixLength(lines) { // https://stackoverflow.com/a/68703218
    const linesToCheck = lines.slice(1).filter(x => x.length > 0);

    let i = 0;
    while (lines[0][i] != null && linesToCheck.every((l) => l[i] === lines[0][i])) {
      i++;
    }

    return i;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('code-block', CodeBlockElement));