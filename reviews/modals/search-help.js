class SearchHelpModal extends BaseModal {
  constructor() {
    super();

    const title = document.createElement('div');
    title.style.fontSize = '200%';
    title.style.fontWeight = 'bold';
    title.innerText = "'Search' help";
    this.element.append(title);

    const body = document.createElement('div');
    body.style.whiteSpace = 'pre';
    body.innerHTML = `
To search, just write your query into the search box. Each word (separated by space) is searched for in the title and description of the review.

If you want to search a specific field, prefix the word with:
    <code>t:</code> to search tags (search word must match exactly)
For example, to search for games, type <code>t:game</code>

You can prefix a search word with <code>-</code> in order to negate the search. If it matches a review, the review won't show up.
For example, no games: <code>-t:game</code>

If all search words match, the review will show up!
`.trim();
    this.element.append(body);
  }
}