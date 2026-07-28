import { Templates } from '../../templates.mjs';

Templates.register({
  id: 'drake-hotline-bling',
  title: 'Drake Hotline Bling',

  template: {
    render: 'first',
    path: 'templates/drake-hotline-bling/background.jpg',
  },

  modifiers: [{
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
        color: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Ew!',
    },
  }, {
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
        color: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Nice',
    },
  }],
})
