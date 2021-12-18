const Helpers = {
  clearElement: function(element) {
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
  },

  textToId: function(str) {
    return str.toLowerCase()
      .replaceAll('\'', '')
      .replaceAll('#', '')
      .replaceAll(',', '')
      .replaceAll('/', ' ')
      .replaceAll(/\s/g, '-');
  },

  getTitleLevel: function(elem) {
    return parseInt(elem.tagName.toLowerCase().substring(1), 10);
  },

  getTitleId: function(title, text, level) {
    const ids = [];
    for (let i = 2; i <= level; ++i) { ids.push(''); }
    ids[level - 2] = Helpers.textToId(text);

    const titles = document.getElementsByClassName('title');
    for (const elem of titles) {
      if (elem === title) { break; }

      let titleLevel = Helpers.getTitleLevel(elem);
      if (titleLevel < 2 || titleLevel >= level) { continue; }

      ids[titleLevel - 2] = Helpers.textToId(elem.innerText);
    }

    return ids.join('---');
  },

  getDataForTitle: function(title) {
    return _raw_data.find((x) => x.title === title) ?? null;
  },

  isObject: function(variable) {
    return Object.prototype.toString.call(variable) === '[object Object]';
  },

  setTOC: function() {
    const titles = document.querySelectorAll('.title.anchored');
    const container = Helpers.constructors.div('');

    const parents = [{level: -1, elem: container}];
    for (const title of titles) {
      const level = Helpers.getTitleLevel(title);
      while (parents[parents.length - 1].level >= level) { parents.pop(); }

      const id = Helpers.getTitleId(title, title.innerText, level);
      const link = Helpers.constructors.link('#' + id, title.innerText);

      const elem = Helpers.constructors.div('', {classes: ['toc-entry'], children: [link]});
      parents[parents.length - 1].elem.appendChild(elem);

      parents.push({level: level, elem: elem});
    }

    const tocs = document.getElementsByClassName('toc');
    for (const toc of tocs) {
      toc.appendChild(container);
    }
  },

  constructors: {
    _applyObj(elem, obj) {
      if (obj == null) { return; }

      if ('content' in obj) {
        elem.innerHTML = obj.content;
      }

      if ('classes' in obj) {
        obj.classes.forEach((x) => elem.classList.add(x));
      }

      if ('children' in obj) {
        obj.children.forEach((x) => elem.appendChild(x));
      }
    },

    title: function(title, level = 1, anchored = false, obj = {}) {
      const elem = document.createElement('h' + level);
      elem.innerHTML = title;
      elem.classList.add('title');
      this._applyObj(elem, obj);

      if (anchored) {
        elem.classList.add('anchored');
        const id = Helpers.getTitleId(elem, title, level);

        const a = this.link('#' + id, elem.innerHTML);
        a.id = id;
        elem.innerHTML = "";
        elem.appendChild(a);
      }

      return elem;
    },

    link: function(to, title = null, obj = {}) {
      const link = document.createElement('a');
      link.href = to;
      link.innerHTML = title ?? to;
      this._applyObj(link, obj);
      return link;
    },

    span: function(text, obj = {}) {
      const span = document.createElement('span');
      span.innerHTML = text;
      this._applyObj(span, obj);
      return span;
    },

    div: function(text, obj = {}) {
      const div = document.createElement('div');
      div.innerHTML = text;
      this._applyObj(div, obj);
      return div;
    },

    indent: function(level = 2) {
      const span = this.span(' '.repeat(level));
      span.classList.add('keep-whitespace');
      return span;
    },

    break: function() {
      return document.createElement('br');
    },

    toc: function() {
      const container = Helpers.constructors.div('', {classes: ['toc-container']});

      const div = Helpers.constructors.div('', {classes: ['toc']});
      div.appendChild(Helpers.constructors.span('Table of Contents'));
      container.appendChild(div);

      return container;
    },

    code: function(code, language = null, extras = {}) {
      const span = Helpers.constructors.span('', {classes: ['code']});
      if (language != null) {
        CodeLanguages[language].highlight(span, code, extras);
      } else {
        span.innerHTML = code;
      }
      return span;
    },

    codeblock: function(code, language = null, extras = {}) {
      const div = Helpers.constructors.div('', {classes: ['code']});
      if (language != null) {
        CodeLanguages[language].highlight(div, code, extras);
      } else {
        div.innerHTML = code;
      }
      return div;
    },

    ul: function(elements) {
      const ul = document.createElement('ul');

      for (const element of elements) {
        const li = document.createElement('li');
        li.innerHTML = element;
        ul.appendChild(li);
      }

      return ul;
    },

    img: function(src, obj = {}) {
      const img = document.createElement('img');
      img.src = src;
      this._applyObj(img, obj);
      return img;
    },

    fromContent: function(content) {
      if (content.type === 'break') {
        return this.break();
      } else if (content.type === 'link') {
        return this.link(content.link, content.title);
      } else if (content.type === 'title') {
        return this.title(content.title, content.level ?? 1, content.anchored ?? false, content);
      } else if (content.type === 'toc') {
        return this.toc();
      } else if (content.type === 'code') {
        return this.code(content.code, content.language, content);
      } else if (content.type === 'code-block') {
        return this.codeblock(content.code, content.language, content);
      } else if (content.type === 'ul') {
        return this.ul(content.elements);
      } else if (content.type === 'img') {
        return this.img(content.src, content);
      } else {
        return this.span('', content);
      }
    },
  },
};

function getContainer() {
  const container = document.getElementById('container');
  Helpers.clearElement(container);
  return container;
}

function renderList() {
  document.title = 'Namless rants';
  const container = getContainer();

  container.appendChild(Helpers.constructors.title('Rants'));
  for (const entry of _raw_data) {
    container.appendChild(Helpers.constructors.link('?title=' + entry.title, entry.title, {classes: ['font-150p']}));
    container.appendChild(Helpers.constructors.break());
  }
}

function renderRant(title) {
  const data = Helpers.getDataForTitle(title);
  document.title = data.title + ' - Namless rants';
  const container = getContainer();

  container.appendChild(Helpers.constructors.title(data.title));

  for (const content of data.content) {
    const prev = container.lastChild.tagName.toLowerCase();
    if (['br', 'ul'].includes(prev)) {
      container.appendChild(Helpers.constructors.indent());
    }

    if (Helpers.isObject(content)) {
      container.appendChild(Helpers.constructors.fromContent(content));
    } else {
      container.appendChild(Helpers.constructors.span(content));
    }
  }

  Helpers.setTOC();
}

window.addEventListener('load', () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('title')) {
    renderList();
  } else {
    renderRant(url.searchParams.get('title'));
  }
});