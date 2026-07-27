Templates.register({
  id: 'wow-cool-robot',
  title: 'Wow Cool Robot',

  background: {
    path: 'templates/wow-cool-robot/background.png',
  },

  modifiers: [{
    type: 'image',

    title: 'Looking at',
    x: 0,
    y: 100,
    w: 315,
    h: 315,

    defaultFittingType: 'contain',

    pathToExampleValue: 'templates/wow-cool-robot/example.png',
  }, {
    type: 'text',

    title: 'Saying',
    x: 500,
    y: 175,
    w: 150,
    h: 120,

    defaultColor: 'black',

    exampleValue: 'Wow cool robot!',
  }, {
    type: 'text',

    title: 'Missing',
    x: 555,
    y: 45,
    w: 150,
    h: 120,

    defaultColor: 'black',

    exampleValue: 'Yep cool robot',
  }],
});
