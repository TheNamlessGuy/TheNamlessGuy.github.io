const genericStylesheet = new CSSStyleSheet();

const fetchGenericStylesheet = await fetch('/generic.css').then((response) => {
  if (!response.ok) {
    throw new Error(`Could not load generic stylesheet: ${response.status}`);
  }

  return response.text();
});

await genericStylesheet.replace(fetchGenericStylesheet);

export { genericStylesheet };
