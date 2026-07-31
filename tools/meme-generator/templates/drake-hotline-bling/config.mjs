import { Templates } from '../../templates.mjs';

Templates.register({
  id: 'drake-hotline-bling',
  title: 'Drake Hotline Bling',
  saveFileNameTemplate: `Drake dislikes {1} but likes {2}`,

  modifiers: [{
    type: 'image',
    locked: true,

    x: 0,
    y: 0,
    w: 'image',
    h: 'image',

    path: 'templates/drake-hotline-bling/background.jpg',

    defaults: {
      fittingType: 'stretch',
    },
  }, {
    type: 'variable-type',

    title: 'Ew',
    x: 600,
    y: 0,
    w: 600,
    h: 600,

    defaults: {
      image: {
        fittingType: 'contain',
      },
      text: {
        textColor: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Ew!',
    },
  }, {
    type: 'variable-type',

    title: 'Nice',
    x: 600,
    y: 600,
    w: 600,
    h: 600,

    defaults: {
      image: {
        fittingType: 'contain',
      },
      text: {
        textColor: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Nice',
    },
  }],
})
