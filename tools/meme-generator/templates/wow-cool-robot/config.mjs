import { Templates } from '../../templates.mjs';

Templates.register({
  id: 'wow-cool-robot',
  title: 'Wow Cool Robot',
  saveFileNameTemplate: `Local man says '{2}' about {1}, but everyone knows it's actually '{3}'`,

  modifiers: [{
    type: 'image',
    locked: true,

    x: 0,
    y: 0,
    w: 'image',
    h: 'image',

    path: 'templates/wow-cool-robot/background.png',

    defaults: {
      fittingType: 'stretch',
    },
  }, {
    type: 'variable-type',
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
        textColor: 'black',
      },
    },

    example: {
      type: 'image',
      path: 'templates/wow-cool-robot/example.png',
    },
  }, {
    type: 'variable-type',
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
        textColor: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Wow cool robot!',
    },
  }, {
    type: 'variable-type',
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
        textColor: 'black',
      },
    },

    example: {
      type: 'text',
      value: 'Yep cool robot',
    },
  }],
});
