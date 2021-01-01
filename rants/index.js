const languages = {
  nam: {
    keywords: ['func', 'class', 'if', 'else', 'for', 'while', 'int', 'bool', 'new', 'constructor', 'parent', 'print', 'try', 'catch', 'finally', 'this', 'return', 'break', 'continue'],
    symbols: ['=', '+=', '{', '}', '(', ')', '[', ']', ';', ',', '++', '--', '<=', '>=', '<', '>', '?', ':', '+', '-', '*', '/'],
    constants: ['true', 'false', 'null'],
    str: ['\'', '"'],
    eolCommentStart: '//',
    mlCommentStart: '/*',
    mlCommentEnd: '*/',
  },
  bash: {
    keywords: ['echo'],
    symbols: ['[[', ']]', '&&', '||'],
    constants: [],
  }
}

function decode(code) {
  return decodeURIComponent(code).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

function removeBaseIndent(code) {
  let contents = decode(code).split('\n');
  if (contents[0] === '') { contents.splice(0, 1); }
  if (contents[contents.length - 1] === '') { contents.splice(contents.length - 1, 1); }
  let baseIndent = contents[0].search(/\S|$/);
  for (let i = 0; i < contents.length; ++i) {
    contents[i] = contents[i].substr(baseIndent);
  }
  return contents.join('\n');
}

function tokenMatch(token, str, c) {
  return str.substr(c, token.length) === token;
}

function tokenizeNamPseudoLang(code, dataset) {
  let tokens = [];
  let currentlyParsing = null;
  let startStrSymbol = null;
  let eocSymbol = null;
  let value = '';

  const keywords = languages.nam.keywords.concat('keywords' in dataset ? dataset.keywords.split(',') : []);
  const symbols = languages.nam.symbols.concat('symbols' in dataset ? dataset.symbols.split(',') : []);
  const constants = languages.nam.constants.concat('constants' in dataset ? dataset.constants.split(',') : []);
  keywords.sort((a, b) => a.length < b.length);
  symbols.sort((a, b) => a.length < b.length);
  constants.sort((a, b) => a.length < b.length);

  for (let c = 0; c < code.length; ++c) {
    let ch = code[c];
    if (currentlyParsing === 'string') {
      if (ch === startStrSymbol) {
        tokens.push({type: 'string', value: value + ch});
        value = '';
        currentlyParsing = null;
      } else {
        value += ch;
      }
    } else if (currentlyParsing === 'number') {
      if (isNaN(ch)) {
        tokens.push({type: 'constant', value: value});
        value = '';
        currentlyParsing = null;
        --c;
      } else {
        value += ch;
      }
    } else if (currentlyParsing === 'whitespace') {
      if (ch !== ' ' && ch !== '\n') {
        tokens.push({type: 'whitespace', value: value.replaceAll('\n', '<br>')});
        value = '';
        currentlyParsing = null;
        --c;
      } else {
        value += ch;
      }
    } else if (currentlyParsing === 'name') {
      if (!ch.match(/[A-Za-z0-9_]/)) {
        tokens.push({type: 'name', value: value});
        value = '';
        currentlyParsing = null;
        --c;
      } else {
        value += ch;
      }
    } else if (currentlyParsing === 'comment') {
      if (tokenMatch(eocSymbol, code, c)) {
        tokens.push({type: 'comment', value: value + eocSymbol});
        c += eocSymbol.length - 1;
        value = '';
        currentlyParsing = null;
        eocSymbol = null;
      } else {
        value += ch;
      }
    } else if (languages.nam.str.indexOf(ch) !== -1) {
      startStrSymbol = ch;
      value = ch;
      currentlyParsing = 'string';
    } else if (ch === ' ' || ch === '\n') {
      value = ch;
      currentlyParsing = 'whitespace';
    } else if (!isNaN(ch)) {
      value = ch;
      currentlyParsing = 'number';
    } else {
      if (tokenMatch(languages.nam.eolCommentStart, code, c)) {
        currentlyParsing = 'comment';
        value = ch;
        eocSymbol = '\n';
        continue;
      } else if (tokenMatch(languages.nam.mlCommentStart, code, c)) {
        currentlyParsing = 'comment';
        value = ch;
        eocSymbol = languages.nam.mlCommentEnd;
        continue;
      }

      let found = false;
      for (let keyword of keywords) {
        if (tokenMatch(keyword, code, c)) {
          found = true;
          tokens.push({type: 'keyword', value: keyword});
          c += keyword.length - 1;
          break;
        }
      }
      if (found) { continue; }

      for (let symbol of symbols) {
        if (tokenMatch(symbol, code, c)) {
          found = true;
          tokens.push({type: 'symbol', value: symbol});
          c += symbol.length - 1;
          break;
        }
      }
      if (found) { continue; }

      for (let constant of constants) {
        if (tokenMatch(constant, code, c)) {
          found = true;
          tokens.push({type: 'constant', value: constant});
          c += constant.length - 1;
          break;
        }
      }
      if (found) { continue; }

      value = ch;
      currentlyParsing = 'name';
    }
  }

  if (currentlyParsing === 'whitespace') {
    tokens.push({type: 'whitespace', value: value.replaceAll('\n', '<br>')});
  } else if (currentlyParsing === 'number') {
    tokens.push({type: 'constant', value: value});
  } else if (currentlyParsing === 'name') {
    tokens.push({type: 'name', value: value});
  }

  return tokens;
}

function highlightNamPseudoLang(codeElem) {
  const code = removeBaseIndent(codeElem.innerHTML);
  const tokens = tokenizeNamPseudoLang(code, codeElem.dataset);

  let result = '';
  for (let token of tokens) {
    if (token.type === 'whitespace') {
      result += token.value;
    } else {
      result += '<span class="code-' + token.type + '">' + token.value + '</span>';
    }
  }
  codeElem.innerHTML = result;
}

function highlightOtherLang(codeElem) {
  let names = 'names' in codeElem.dataset ? codeElem.dataset.names.split(',') : [];
  let keywords;
  let symbols;
  let constants;
  if ('lang' in codeElem.dataset) {
    keywords = languages[codeElem.dataset.lang].keywords;
    symbols = languages[codeElem.dataset.lang].symbols;
    constants = languages[codeElem.dataset.lang].constants;
  } else {
    keywords = 'keywords' in codeElem.dataset ? codeElem.dataset.keywords.split(',') : [];
    symbols = 'symbols' in codeElem.dataset ? codeElem.dataset.symbols.split(',') : [];
    constants = 'constants' in codeElem.dataset ? codeElem.dataset.constants.split(',') : [];
  }

  let contents = removeBaseIndent(codeElem.innerHTML);
  for (let symbol of symbols) { contents = contents.replaceAll(symbol, '<span class="code-symbol">' + symbol + '</span>'); }
  for (let keyword of keywords) { contents = contents.replaceAll(keyword, '<span class="code-keyword">' + keyword + '</span>'); }
  for (let name of names) { contents = contents.replaceAll(name, '<span class="code-name">' + name + '</span>'); }
  for (let constant of constants) { contents = contents.replaceAll(constant, '<span class="code-constant">' + constant + '</span>'); }

  codeElem.innerHTML = contents.replaceAll('\n', '<br>');
}

function generateTableOfContents() {
  const toc = document.getElementById('toc');
  if (toc == null) {
    return;
  }

  const tocContainer = document.createElement('div');
  tocContainer.id = 'toc-container';

  const tocTitle = document.createElement('span');
  tocTitle.innerHTML = 'Table of Contents';
  tocContainer.appendChild(tocTitle);

  const tocEllipsis = document.createElement('span');
  tocEllipsis.innerHTML = ' ...';
  tocEllipsis.classList.add('hidden');
  tocContainer.appendChild(tocEllipsis);

  const headers = document.querySelectorAll('h2, h3');
  const container = document.createElement('div');
  let parentAnchorIds = [];
  let lastHeaderLevel = 1;
  for (let i = 0; i < headers.length; ++i) {
    const anchorId = headers[i].innerText.toLowerCase().replaceAll(/[^a-z0-9]/g, '-');
    const headerLevel = parseInt(headers[i].nodeName[1], 10);
    if (headerLevel < lastHeaderLevel) {
      for (let i = 0; i < (lastHeaderLevel - headerLevel) + 1; ++i) {
        parentAnchorIds.pop();
      }
    } else if (headerLevel === lastHeaderLevel) {
      parentAnchorIds.pop();
    }

    const anchor = document.createElement('a');
    anchor.innerHTML = headers[i].innerHTML;
    anchor.id = (parentAnchorIds.length > 0) ? parentAnchorIds.join('---') + '---' + anchorId : anchorId;
    anchor.href = '#' + anchor.id;
    headers[i].innerHTML = '';
    headers[i].appendChild(anchor);

    parentAnchorIds.push(anchorId);

    const headerContainer = document.createElement('div');
    const tocAnchor = document.createElement('a');
    tocAnchor.href = '#' + anchor.id;
    tocAnchor.innerHTML = '    '.repeat(headerLevel - 1) + anchor.innerHTML;
    headerContainer.appendChild(tocAnchor);
    container.appendChild(headerContainer);
    lastHeaderLevel = headerLevel;
  }

  tocTitle.addEventListener('click', () => {
    container.classList.toggle('hidden');
    tocEllipsis.classList.toggle('hidden');
  });
  tocContainer.appendChild(container);
  toc.appendChild(tocContainer);
}

window.addEventListener('load', () => {
  const codeElems = document.getElementsByClassName('code');
  for (let codeElem of codeElems) {
    if ('lang' in codeElem.dataset && codeElem.dataset.lang === 'nam') {
      highlightNamPseudoLang(codeElem);
    } else {
      highlightOtherLang(codeElem);
    }
  }

  generateTableOfContents();
});