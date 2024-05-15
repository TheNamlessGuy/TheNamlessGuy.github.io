const Table = {
  sorted: {
    by: null,
    asc: null,

    default: {
      by: 'reviewed_at',
      asc: false,
    }
  },

  _setup: {
    header: function(table) {
      const rows = Array.from(table.getElementsByTagName('thead')[0].getElementsByTagName('th'));

      for (const row of rows) {
        const by = row.getAttribute('key');
        const sorter = row.getElementsByTagName('c-icon')[0];
        sorter.addEventListener('click', () => Table.sort(by, (Table.sorted.by === by) ? !Table.sorted.asc : false));
      }
    },

    row: function(row, id) {
      const container = document.createElement('tr');
      container.id = `table-row-${id}`;
      container.addEventListener('click', () => {
        ReviewModal.show(row);
      });

      const title = document.createElement('td');
      title.classList.add('title');
      title.innerText = row.title ?? '';

      const score = document.createElement('td');
      score.classList.add('score');
      score.innerText = row.score ?? '';

      const reviewedAt = document.createElement('td');
      reviewedAt.classList.add('reviewed_at');
      if (row.reviewed_at) {
        reviewedAt.innerText = row.reviewed_at[row.reviewed_at.length - 1];
      }

      const descriptionContainer = document.createElement('td');
      descriptionContainer.classList.add('description');
      const description = document.createElement('div');
      description.title = row.description ?? '';
      description.innerText = row.description ?? '';
      descriptionContainer.append(description);

      container.append(title, score, reviewedAt, descriptionContainer);
      return container;
    },
  },

  generate: function(data) {
    const table = document.getElementById('table');
    Table._setup.header(table);

    const tbody = table.getElementsByTagName('tbody')[0];
    for (let i = 0; i < data.items.length; ++i) {
      const row = Table._setup.row(data.items[i], i);
      if (i + 1 === data.items.length) { row.classList.add('last'); }
      tbody.append(row);
    }
  },

  _matchesFilter: function(row, query) {
    const idx = parseInt(row.id.substring('table-row-'.length));
    const title = row.getElementsByClassName('title')[0].innerText.toLowerCase();
    const desc = row.getElementsByClassName('description')[0].innerText.toLowerCase();
    const tags = _raw_data.items[idx].tags ?? [];

    for (let term of query) {
      const negated = term.startsWith('-');
      if (negated) { term = term.substring(1); }

      if (term.startsWith('t:')) {
        if (tags.includes(term.substring(2)) === negated) { return false; }
      } else {
        let match = title.includes(term);
        if (match) {
          if (negated) { return false; }
        } else {
          match = desc.includes(term);
          if (match === negated) { return false; }
        }
      }
    }

    return true;
  },

  filter: function(query) {
    const table = document.getElementById('table');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr')).filter((row) => row.id !== 'no-results-row');

    const split = query.toLowerCase().split(' ');
    let lastVisible = null;
    for (const row of rows) {
      row.classList.remove('last');

      if (Table._matchesFilter(row, split)) {
        lastVisible = row;
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    }

    const noResults = document.getElementById('no-results-row');
    if (lastVisible != null) {
      noResults.classList.add('hidden');
      noResults.classList.remove('last');
      lastVisible.classList.add('last');
    } else {
      noResults.classList.add('last');
      noResults.classList.remove('hidden');
    }

    QueryParameters.set('q', query);
  },

  sort: function(by, asc) {
    Table.sorted.by = by;
    Table.sorted.asc = asc;

    const table = document.getElementById('table');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr')).filter((row) => row.id !== 'no-results-row');

    const before = asc ? 1 : -1;
    const after  = asc ? -1 : 1;

    const sorted = rows.sort((a, b) => {
      aTitle = a.getElementsByClassName('title')[0].innerText;
      bTitle = b.getElementsByClassName('title')[0].innerText;
      a = a.getElementsByClassName(by)[0].innerText;
      b = b.getElementsByClassName(by)[0].innerText;

      if (a === '' && b !== '') {
        return after;
      } else if (a !== '' && b === '') {
        return before;
      }

      if (a > b) {
        return before;
      } else if (a < b) {
        return after;
      } else if (aTitle > bTitle) {
        return before;
      } else if (aTitle < bTitle) {
        return after;
      }

      return 0;
    });

    let lastVisible = null;
    for (let r = 0; r < rows.length; ++r) {
      tbody.append(rows[r]);
      rows[r].classList.remove('last');

      if (!rows[r].classList.contains('hidden')) {
        lastVisible = rows[r];
      }
    }

    if (lastVisible) {
      lastVisible.classList.add('last');
    }

    QueryParameters.set('sort-by', (Table.sorted.default.by === by) ? null : by);
    QueryParameters.set('sort-direction', (Table.sorted.default.asc === asc) ? null : (asc ? 'asc' : 'desc'));
  },
};

window.addEventListener('DOMContentLoaded', () => {
  Table.generate(_raw_data);

  Table.sort(
    QueryParameters.get('sort-by', Table.sorted.default.by),
    QueryParameters.get('sort-direction', Table.sorted.default.asc) === 'asc',
  );

  const search = document.getElementById('search');
  search.value = QueryParameters.get('q', '');
  Table.filter(search.value);
  search.addEventListener('keyup', () => Table.filter(search.value));

  const viewing = QueryParameters.get('viewing');
  if (viewing) {
    document.getElementById(`table-row-${viewing}`).click();
  }

  document.getElementById('search-help').addEventListener('click', () => SearchHelpModal.show());
});