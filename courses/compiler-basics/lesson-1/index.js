const functions = {
  compile1: () => {
    const input = document.getElementById('code-input-1').value;

    let i = 0;
    let parsing = null;
    let buffer = '';
    const tokens = [];
    while (i < input.length) {
      const c = input[i];

      if (parsing === 'number') {
        if (!c.match(/\d/)) {
          tokens.push({type: 'number', value: parseInt(buffer, 10)});
          parsing = null;
          continue; // Note: Do not increment i - we want to check this c again
        }

        buffer += c; // If c still is a number, keep filling up the buffer
        i += 1;
        continue;
      }

      if (c.match(/\d/)) {
        parsing = 'number';
        buffer = c;
      } else if (['+', '-', '*', '/'].includes(c)) {
        tokens.push({type: 'operator', value: c});
      } else if (!c.match(/\s/)) {
        document.getElementById('code-output-1').innerText = `Unexpected character '${c}' found`;
        return;
      }

      i += 1;
    }

    if (parsing === 'number') {
      tokens.push({type: 'number', value: parseInt(buffer, 10)});
    }

    document.getElementById('code-output-1').innerText = 'Tokens: ' + JSON.stringify(tokens);
  },
};

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('code-submit-1').addEventListener('click', functions.compile1);
});