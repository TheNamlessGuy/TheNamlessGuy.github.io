function rand(startval, endval) {
  return Math.floor(Math.random() * (endval - startval + 1)) + startval;
}

function either(val1, val2) {
  return (Math.random() >= 0.5) ? val1 : val2;
}