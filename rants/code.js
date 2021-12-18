const CodeLanguages = {
  _help: {
    decode: function(code) {
      return decodeURIComponent(code).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
    },

    tokenMatch: function(token, str, c) {
      return str.substr(c, token.length) === token;
    },

    removeBaseIndent: function(code) {
      let contents = CodeLanguages._help.decode(code).split('\n');
      if (contents[0] === '') { contents.splice(0, 1); }
      if (contents[contents.length - 1] === '') { contents.splice(contents.length - 1, 1); }

      let baseIndent = contents[0].search(/\S|$/);
      for (let i = 0; i < contents.length; ++i) {
        contents[i] = contents[i].substr(baseIndent);
      }

      return contents.join('\n');
    },
  },

  psuedo: {
    keywords: ['func', 'class', 'if', 'else', 'for', 'while', 'int', 'bool', 'new', 'constructor', 'parent', 'print', 'try', 'catch', 'finally', 'this', 'return', 'break', 'continue'],
    symbols: ['=', '+=', '{', '}', '(', ')', '[', ']', ';', ',', '++', '--', '<=', '>=', '<', '>', '?', ':', '+', '-', '*', '/'],
    constants: ['true', 'false', 'null'],
    str: ['\'', '"'],
    eolCommentStart: '//',
    mlCommentStart: '/*',
    mlCommentEnd: '*/',

    tokenize: function(code, dataset) { // TODO: What the fuck is this? Rewrite
      let tokens = [];
      let currentlyParsing = null;
      let startStrSymbol = null;
      let eocSymbol = null;
      let value = '';

      const keywords = CodeLanguages.psuedo.keywords.concat('keywords' in dataset ? dataset.keywords : []);
      const symbols = CodeLanguages.psuedo.symbols.concat('symbols' in dataset ? dataset.symbols : []);
      const constants = CodeLanguages.psuedo.constants.concat('constants' in dataset ? dataset.constants : []);
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
          if (CodeLanguages._help.tokenMatch(eocSymbol, code, c)) {
            tokens.push({type: 'comment', value: value + eocSymbol});
            c += eocSymbol.length - 1;
            value = '';
            currentlyParsing = null;
            eocSymbol = null;
          } else {
            value += ch;
          }
        } else if (CodeLanguages.psuedo.str.indexOf(ch) !== -1) {
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
          if (CodeLanguages._help.tokenMatch(CodeLanguages.psuedo.eolCommentStart, code, c)) {
            currentlyParsing = 'comment';
            value = ch;
            eocSymbol = '\n';
            continue;
          } else if (CodeLanguages._help.tokenMatch(CodeLanguages.psuedo.mlCommentStart, code, c)) {
            currentlyParsing = 'comment';
            value = ch;
            eocSymbol = CodeLanguages.psuedo.mlCommentEnd;
            continue;
          }

          let found = false;
          for (let keyword of keywords) {
            if (CodeLanguages._help.tokenMatch(keyword, code, c)) {
              found = true;
              tokens.push({type: 'keyword', value: keyword});
              c += keyword.length - 1;
              break;
            }
          }
          if (found) { continue; }

          for (let symbol of symbols) {
            if (CodeLanguages._help.tokenMatch(symbol, code, c)) {
              found = true;
              tokens.push({type: 'symbol', value: symbol});
              c += symbol.length - 1;
              break;
            }
          }
          if (found) { continue; }

          for (let constant of constants) {
            if (CodeLanguages._help.tokenMatch(constant, code, c)) {
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
    },

    highlight: function(elem, text, extras = {}) {
      const code = CodeLanguages._help.removeBaseIndent(text);
      const tokens = this.tokenize(code, extras);

      let result = '';
      for (let token of tokens) {
        if (token.type === 'whitespace') {
          result += token.value;
        } else {
          result += '<span class="code-' + token.type + '">' + token.value + '</span>';
        }
      }

      elem.innerHTML = result;
    },
  }, // psuedo

  bash: {
    keywords: ['echo'],
    symbols: ['[[', ']]', '&&', '||'],
    constants: [],

    highlight: function(elem, text, extras = {}) {
      const names = 'names' in extras ? extras.names : [];
      const keywords = CodeLanguages.bash.keywords.concat('keywords' in extras ? extras.keywords : []);
      const symbols = CodeLanguages.bash.symbols.concat('symbols' in extras ? extras.symbols : []);
      const constants = CodeLanguages.bash.constants.concat('constants' in extras ? extras.constants : []);
      keywords.sort((a, b) => a.length < b.length);
      symbols.sort((a, b) => a.length < b.length);
      constants.sort((a, b) => a.length < b.length);

      let contents = CodeLanguages._help.removeBaseIndent(text);
      for (let symbol of symbols) { contents = contents.replaceAll(symbol, '<span class="code-symbol">' + symbol + '</span>'); }
      for (let keyword of keywords) { contents = contents.replaceAll(keyword, '<span class="code-keyword">' + keyword + '</span>'); }
      for (let name of names) { contents = contents.replaceAll(name, '<span class="code-name">' + name + '</span>'); }
      for (let constant of constants) { contents = contents.replaceAll(constant, '<span class="code-constant">' + constant + '</span>'); }

      elem.innerHTML = contents.replaceAll('\n', '<br>');
    }
  }, // bash
};