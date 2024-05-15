class CustomHeaderElement extends CustomHTMLElement {
  static key = 'c-header';
  static style = `
.container {
  margin-top: 15px;
  position: relative;
}

.lhs, .rhs {
  position: absolute;
  top: 0;

  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.lhs { left: 0; }
.rhs { right: 0; }

.center {
  font-size: 200%;
  font-weight: bold;
}
`;

  init() {
    const container = document.createElement('div');
    container.classList.add('container');

    const lhsElem = this.getElementsByTagName('lhs')[0];
    lhsElem?.remove();
    const centerElem = this.getElementsByClassName('center')[0];
    centerElem?.remove();
    const rhsElem = this.getElementsByTagName('rhs')[0];
    rhsElem?.remove();

    const lhs = document.createElement('div');
    lhs.classList.add('lhs');
    if (lhsElem) {
      lhs.append(...lhsElem.childNodes);
    }

    const center = document.createElement('div');
    center.classList.add('center');
    center.innerText = centerElem ? centerElem.innerText : this.innerText;

    const rhs = document.createElement('div');
    rhs.classList.add('rhs');
    if (rhsElem) {
      rhs.append(...rhsElem.childNodes);
    }

    container.append(lhs, center, rhs);
    return [container];
  }
}

window.addEventListener('DOMContentLoaded', () => CustomHeaderElement.setup());