const sort = {
  by: 'reviewed_at',
  asc: false,
};
const sortDefault = JSON.parse(JSON.stringify(sort));

const sortDirections = {
  'title': true,
  'score': false,
  'reviewed_at': false,
  'description': true,
}

function setURLParameter(key, value) {
  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }

  window.history.pushState(null, '', url.toString());
}

function loadTemplates() {
  return {
    tableHeader: document.getElementById('template-table-header'),
    tableBody: document.getElementById('template-table-body'),
    tableRow: document.getElementById('template-table-row'),
  };
}

function initTemplate(template) {
  return template.content.firstElementChild.cloneNode(true);
}

function onSorterClick(which) {
  if (sort.by !== which) {
    sort.by = which;

    if (sort.asc === sortDirections[which]) {
      sort.asc = !sort.asc;
    } else {
      sort.asc = sortDirections[which];
    }
  } else {
    sort.asc = !sort.asc;
  }

  setURLParameter('sort-by', sort.by === sortDefault.by ? null : sort.by);
  setURLParameter('sort-direction', sort.asc === sortDefault.asc ? null : (sort.asc ? 'asc' : 'desc'));
  generateTable(_raw_data);
}

function generateHeader(table, templates) {
  const header = initTemplate(templates.tableHeader);
  table.appendChild(header);

  [].slice.call(header.getElementsByClassName('table-sorter')).forEach(function(e) {
    const which = [].slice.call(e.classList).find(x => x.startsWith('table-sorter-')).substr(13).replaceAll('-', '_'); // 13 = 'table-sorter-'.length
    e.addEventListener('click', () => { onSorterClick(which); });
  });
}

function generateBody(table, templates) {
  const body = initTemplate(templates.tableBody);
  table.appendChild(body);

  return body;
}

function showModal(item) {
  const linkElem = document.getElementById('modal-link');
  setAndGetValue(item.link, 'No link', linkElem);
  linkElem.href = item.link ?? '#';

  setAndGetValue(item.title, 'No title', document.getElementById('modal-title'));
  setAndGetValue(item.score, 'No score', document.getElementById('modal-score'));
  setAndGetValue(item.reviewed_at, 'No reviewed at date', document.getElementById('modal-reviewed-at'));
  setAndGetValue(item.description?.replaceAll('\n', '<br>'), 'No description', document.getElementById('modal-description'));
  setAndGetValue(item.tags, 'No tags', document.getElementById('modal-tags'));

  document.getElementById('modal-container').classList.remove('hidden');
  recenterModal();
}

function recenterModal() {
  const modal = document.getElementById('modal');
  modal.style.marginLeft = -(modal.offsetWidth / 2) + 'px';
  modal.style.marginTop = -(modal.offsetHeight / 2) + 'px';

  const boundingRect = modal.getBoundingClientRect();
  if (boundingRect.y - 5 < 0) {
    modal.style.marginTop = -(modal.offsetHeight / 2) + Math.abs(boundingRect.y - 5) + 'px';
  }
}

function hideModal() {
  document.getElementById('modal-container').classList.add('hidden');
}

function setAndGetValue(value, defaultValue, container) {
  if (!value) {
    container.classList.add('empty');
    container.innerHTML = defaultValue;
    return defaultValue;
  }

  container.classList.remove('empty');
  container.innerHTML = Array.isArray(value) ? value.join(', ') : value;
  return value;
}

function generateTableEntry(container, item, templates) {
  const row = initTemplate(templates.tableRow);
  item._row = row;

  setAndGetValue(item.title, 'No title', row.getElementsByClassName('table-cell-title')[0]);
  setAndGetValue(item.score, 'No score', row.getElementsByClassName('table-cell-score')[0]);
  setAndGetValue(item.reviewed_at, 'No reviewed at date', row.getElementsByClassName('table-cell-reviewed-at')[0]);

  const description = row.getElementsByClassName('table-cell-description')[0].getElementsByTagName('div')[0];
  description.dataset.content = setAndGetValue(item.description, 'No description', description);

  row.addEventListener('click', () => { showModal(item); });
  container.appendChild(row);
}

function sortItems(items) {
  const sorted = [...items].sort((a, b) => {
    if (a[sort.by] == null && b[sort.by] != null) {
      return -1;
    } else if (a[sort.by] != null && b[sort.by] == null) {
      return 1;
    }

    if (a[sort.by] > b[sort.by]) {
      return 1;
    } else if (a[sort.by] < b[sort.by]) {
      return -1;
    } else if (a.title > b.title) {
      return sort.asc ? 1 : -1;
    } else if (a.title < b.title) {
      return sort.asc ? -1 : 1;
    }

    return 0;
  });

  if (!sort.asc) {
    sorted.reverse();
  }

  return sorted;
}

function setSearchables(item) {
  item._search = {};
  item._search.title = item.title?.toLowerCase() ?? '';
  item._search.score = item.score?.toString() ?? '';
  item._search.reviewed_at = item.reviewed_at?.toLowerCase() ?? '';
  item._search.description = item.description?.toLowerCase() ?? '';
  item._search.tags = item.tags.map(x => x.toLowerCase());
}

let items = null;
function generateTable(data) {
  const templates = loadTemplates();

  const table = document.getElementById('table');
  while (table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  generateHeader(table, templates);
  const body = generateBody(table, templates);

  let lastItem = null;
  items = sortItems(data.items);
  for (const item of items) {
    if (item._row) {
      item._row.classList.remove('last');
      body.appendChild(item._row);
    } else {
      generateTableEntry(body, item, templates);
      setSearchables(item);
    }

    if (!body.lastChild.classList.contains('hidden')) {
      lastItem = body.lastChild;
    }
  }

  if (lastItem) {
    lastItem.classList.add('last');
  }
}

function itemMatchesFilter(item, split) {
  for (const s of split) {
    if (s.startsWith('t:')) {
      return item._search.tags.includes(s.substr(2));
    }

    if (item._search.title.includes(s)) {
      return true;
    } else if (item._search.description.includes(s)) {
      return true;
    } else if (item._search.reviewed_at.includes(s)) {
      return true;
    } else if (item._search.score.includes(s)) {
      return true;
    }
  }

  return false;
}

function filter(query) {
  const split = query.toLowerCase().split(' ');

  let matches = 0;
  let lastMatch = null;
  for (const item of items) {
    item._row.classList.remove('last');

    const match = itemMatchesFilter(item, split);
    if (match) {
      matches += 1;
      lastMatch = item._row;
      item._row.classList.remove('hidden');
    } else {
      item._row.classList.add('hidden');
    }
  }

  document.getElementById('table-no-results-row').classList.toggle('hidden', matches !== 0);
  if (lastMatch !== null) {
    lastMatch.classList.add('last');
  }
}

function startup() {
  const url = new URL(window.location.href);

  if (url.searchParams.has('sort-by')) {
    sort.by = url.searchParams.get('sort-by');
  }

  if (url.searchParams.has('sort-direction')) {
    sort.asc = url.searchParams.get('sort-direction') === 'asc';
  }

  generateTable(_raw_data);

  if (url.searchParams.has('q')) {
    const search = document.getElementById('search');
    search.value = url.searchParams.get('q');
    filter(search.value);
  }
}

window.addEventListener('load', () => {
  startup();

  document.getElementById('modal-container').addEventListener('click', () => {
    hideModal();
  });
  document.getElementById('modal').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const search = document.getElementById('search');
  search.addEventListener('keyup', () => {
    setURLParameter('q', search.value);
    filter(search.value);
  });
});