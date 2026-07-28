import { Templates } from '../../templates.mjs';

Templates.register({
  id: 'wow-cool-robot',
  title: 'Wow Cool Robot',

  template: {
    render: 'first',
    path: 'templates/wow-cool-robot/background.png',
  },

  modifiers: [{
    title: 'Looking at',
    x: 0,
    y: 100,
    w: 315,
    h: 315,

    defaults: {
      image: {
        fittingType: 'contain',
      },
      text: {
        color: 'black',
      },
    },

    example: {
      type: 'image',
      path: 'templates/wow-cool-robot/example.png',
    },
  }, {
    title: 'Saying',
    x: 500,
    y: 175,
    w: 150,
    h: 120,

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
      value: 'Wow cool robot!',
    },
  }, {
    title: 'Missing',
    x: 555,
    y: 45,
    w: 150,
    h: 120,

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
      value: 'Yep cool robot',
    },
  }],
});
