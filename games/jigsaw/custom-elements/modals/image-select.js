class ImageSelectModalElement extends BaseModalElement {
  static tagName = 'image-select-modal';

  static open(data) {
    const modal = this._open(this.tagName);
    modal._onSelectedCallback = data.onSelected ?? null;
    modal._onFetchedCallback = data.onFetched ?? null;
    modal._onErrorCallback = data.onError ?? null;
    modal._show();
  }

  hide() {
    this._hide();
  }

  static _pictures = [
    {name: 'NamBot (Color)',     src: 'images/nambot-color.png'},
    {name: 'NamBot (Colorless)', src: 'images/nambot-colorless.png'},
    {name: 'Milo (1)',           src: 'images/milo-1.jpg'},
    {name: 'Milo (2)',           src: 'images/milo-2.jpg'},
  ];

  static _apis = [{
    what: 'photo',
    who: 'https://picsum.photos/',
    src: () => `https://picsum.photos/${Random.number(500, 1500)}`,
  }, {
    what: 'photo',
    who: 'https://random.imagecdn.app/',
    src: () => {
      const size = Random.number(500, 1500);
      return `https://random.imagecdn.app/${size}/${size}`;
    },
  }, {
    what: 'image',
    who: 'https://unsplash.com/',
    src: 'https://source.unsplash.com/random/',
  }, {
    what: 'dog',
    who: 'https://random.dog/',
    src: 'https://random.dog/woof.json?include=jpg,png',
    extract: function(response) { return response.url; },
  }, {
    what: 'dog',
    who: 'https://dog.ceo/',
    src: 'https://dog.ceo/api/breeds/image/random',
    extract: function(response) { return response.message; },
  }, {
    what: 'dog',
    who: 'https://shibe.online/',
    src: 'https://shibe.online/api/shibes?count=1',
    extract: function(response) { return response[0]; },
  }, {
    what: 'fox',
    who: 'https://randomfox.ca/',
    src: 'https://randomfox.ca/floof/',
    extract: function(response) { return response.image; },
  }];

  _onSelectedCallback = null;
  _onSelected() {
    if (this._onSelectedCallback) {
      this._onSelectedCallback();
    }

    this.hide();
  }

  _onFetchedCallback = null;
  _onFetched(data) {
    if (this._onFetchedCallback) {
      this._onFetchedCallback(data);
    }
  }

  _onErrorCallback = null;
  _onError(error) {
    if (this._onErrorCallback) {
      this._onErrorCallback(error);
    }
  }

  _tabs = {
    container: null,
    contentContainer: null,
    entries: {
      pictures: {
        tab: null,
        body: null,
      },
      api: {
        tab: null,
        body: null,
      },
      upload: {
        tab: null,
        body: null,
      },
    },
  };

  constructor() {
    super();

    this.sticky = false;
    this.title = 'Select image';
    this._elements.style.textContent += `
underline { text-decoration: underline; }

.modal {
  max-width: 340px;
  max-height: 60vh;
}

.tab-container { margin-top: 15px; }
.tab-content-container { margin-top: 15px; }

.tab {
  color: #AAA;
  border: 1px solid #AAA;
  border-bottom: 0;
  padding: 5px;
  user-select: none;
  cursor: pointer;
}
.tab.selected {
  color: #FFF;
  border-color: #FFF;
  cursor: default;
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-content { display: none; }
.tab-content.selected {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.picture-container {
  border: 1px solid #FFF;
  width: fit-content;
  height: fit-content;
  padding: 5px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.picture-container > img {
  max-width: 50px;
  max-height: 50px;
}
`;

    this._setFooterButtons([{
      title: 'Cancel',
      onClick: () => this.hide(),
    }]);

    this._tabs.container = document.createElement('div');
    this._tabs.container.classList.add('tab-container');
    this._elements.body.base.append(this._tabs.container);

    this._tabs.contentContainer = document.createElement('div');
    this._tabs.contentContainer.classList.add('tab-content-container');
    this._elements.body.base.append(this._tabs.contentContainer);

    this._setupPictures();
    this._setupAPIs();
    this._setupUpload();
  }

  _setupPictures() {
    this._tabs.entries.pictures.tab = document.createElement('span');
    this._tabs.entries.pictures.tab.classList.add('tab', 'selected');
    this._tabs.entries.pictures.tab.addEventListener('click', function() {
      const selectedTab = this._tabs.container.querySelector('.tab.selected');
      if (selectedTab) { selectedTab.classList.remove('selected'); }
      const selectedBody = this._tabs.contentContainer.querySelector('.tab-content.selected');
      if (selectedBody) { selectedBody.classList.remove('selected'); }

      this._tabs.entries.pictures.tab.classList.add('selected');
      this._tabs.entries.pictures.body.classList.add('selected');
    }.bind(this));
    this._tabs.entries.pictures.tab.innerText = 'Pictures';
    this._tabs.container.append(this._tabs.entries.pictures.tab);

    this._tabs.entries.pictures.body = document.createElement('div');
    this._tabs.entries.pictures.body.classList.add('tab-content', 'selected');
    this._tabs.contentContainer.append(this._tabs.entries.pictures.body);

    for (const picture of ImageSelectModalElement._pictures) {
      const container = document.createElement('div');
      container.classList.add('picture-container');
      container.addEventListener('click', () => {
        this._onSelected();
        this._onFetched(picture);
      });

      const img = document.createElement('img');
      img.src = picture.src;
      container.append(img);

      const name = document.createElement('div');
      name.innerText = picture.name;
      container.append(name);

      this._tabs.entries.pictures.body.append(container);
    }
  }

  _setupAPIs() {
    this._tabs.entries.api.tab = document.createElement('span');
    this._tabs.entries.api.tab.classList.add('tab');
    this._tabs.entries.api.tab.addEventListener('click', function() {
      const selectedTab = this._tabs.container.querySelector('.tab.selected');
      if (selectedTab) { selectedTab.classList.remove('selected'); }
      const selectedBody = this._tabs.contentContainer.querySelector('.tab-content.selected');
      if (selectedBody) { selectedBody.classList.remove('selected'); }

      this._tabs.entries.api.tab.classList.add('selected');
      this._tabs.entries.api.body.classList.add('selected');
    }.bind(this));
    this._tabs.entries.api.tab.innerText = 'Random image API';
    this._tabs.container.append(this._tabs.entries.api.tab);

    this._tabs.entries.api.body = document.createElement('div');
    this._tabs.entries.api.body.classList.add('tab-content');
    this._tabs.contentContainer.append(this._tabs.entries.api.body);

    for (const api of ImageSelectModalElement._apis) {
      const container = document.createElement('div');
      container.classList.add('picture-container');
      container.addEventListener('click', () => this._fetchAndSendAPIContents(api));

      const name = document.createElement('div');
      name.innerHTML = `Random ${api.what} courtesy of <underline>${api.who}</underline>`;
      container.append(name);

      this._tabs.entries.api.body.append(container);
    }
  }

  async _fetchAndSendAPIContents(api) {
    this._onSelected();

    const request = await fetch(api.src instanceof Function ? api.src() : api.src, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
    }).catch(e => e);

    if (request instanceof Error) {
      this._onError(request);
      return;
    }

    let src;
    if (api.extract) {
      src = api.extract(await request.json());
    } else {
      src = URL.createObjectURL(await request.blob());
    }

    this._onFetched({
      name: `Random ${api.what} courtesy of <a href="${api.who}">${api.who}</a>`,
      src: src,
    });
  }

  _setupUpload() {
    this._tabs.entries.upload.tab = document.createElement('span');
    this._tabs.entries.upload.tab.classList.add('tab');
    this._tabs.entries.upload.tab.addEventListener('click', function() {
      const selectedTab = this._tabs.container.querySelector('.tab.selected');
      if (selectedTab) { selectedTab.classList.remove('selected'); }
      const selectedBody = this._tabs.contentContainer.querySelector('.tab-content.selected');
      if (selectedBody) { selectedBody.classList.remove('selected'); }

      this._tabs.entries.upload.tab.classList.add('selected');
      this._tabs.entries.upload.body.classList.add('selected');
    }.bind(this));
    this._tabs.entries.upload.tab.innerText = 'Upload own image';
    this._tabs.container.append(this._tabs.entries.upload.tab);

    this._tabs.entries.upload.body = document.createElement('div');
    this._tabs.entries.upload.body.classList.add('tab-content');
    this._tabs.contentContainer.append(this._tabs.entries.upload.body);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) {
        this._onSelected();
        this._onFetched({
          name: `<i>${input.files[0].name}</i>`,
          src: URL.createObjectURL(input.files[0]),
        });
      }
    });
    this._tabs.entries.upload.body.append(input);
  }
}

window.addEventListener('DOMContentLoaded', () => customElements.define(ImageSelectModalElement.tagName, ImageSelectModalElement));