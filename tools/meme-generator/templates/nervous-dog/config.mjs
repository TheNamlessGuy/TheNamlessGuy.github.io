import { Templates } from '../../templates.mjs';

Templates.register({
  id: 'nervous-dog',
  title: 'Nervous dog',
  saveFileNameTemplate: `Nervous dog is nervous about {0}`,

  modifiers: [{
    type: 'image',
    locked: false,

    title: 'Something to be nervous about',
    x: 0,
    y: 0,
    w: 'image',
    h: 'image',

    defaults: {
      fittingType: 'stretch',
    },

    example: {
      type: 'image',
      path: 'templates/nervous-dog/example.png',
    },
  }, {
    type: 'image',
    locked: true,

    x: 0,
    y: 0,
    w: 'image',
    h: 'image',

    path: 'templates/nervous-dog/foreground.png',

    defaults: {
      fittingType: 'stretch',
      origin: 'bottom-right',
    },
  }],
});
