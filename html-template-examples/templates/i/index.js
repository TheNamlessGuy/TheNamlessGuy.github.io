window.addEventListener('load', async () => {
  const input = document.getElementById('value-in-template');
  input.value = 'Default value';

  const template = await Templates.init(Templates.I, {value: input.value});
  template.replaceTag('i-template'); // Could also specify document (or document.body) as the container, if you really wanted to

  const onChange = () => template.update({value: input.value});
  input.addEventListener('change', onChange);
  input.addEventListener('paste', onChange);
  input.addEventListener('input', onChange);
});