class SidebarContentElement extends HTMLElement {
  constructor() {
    super();

    const container = document.createElement('div');
    container.classList.add('sidebar');

    const location = new URL(window.location.href).pathname.replace('/courses/compiler-basics', '');
    container.appendChild(this._clickable(location, '/', 'Home'));
    container.appendChild(document.createElement('hr'));

    const lessons = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = 'Lessons';
    lessons.appendChild(legend);
    lessons.appendChild(this._clickable(location, '/lesson-1/', 'Lesson 1'));
    lessons.appendChild(this._clickable(location, '/lesson-2/', 'Lesson 2'));
    container.appendChild(lessons);

    const style = document.createElement('style');
    style.textContent = `
.sidebar {
  float: right;
  border-radius: 5px;
  margin: 5px;
  padding: 5px;
  background-color: #333;
  color: #FFF;
}

.sidebar .clickable {
  display: block;
}

a {
  color: #55F;
}
`;
    container.appendChild(style);

    this.attachShadow({mode: 'closed'}).appendChild(container);
  }

  _clickable(current, to, title) {
    let element = null;

    if (current === to) {
      element = document.createElement('span');
      element.classList.add('current-link');
    } else {
      element = document.createElement('a');
      element.href = `/courses/compiler-basics${to}`;
    }

    element.classList.add('clickable');
    element.innerText = title;
    return element;
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define('sidebar-content', SidebarContentElement));