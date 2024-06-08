const PipBoyTheme = {
  actual: null,

  set: function(to, temporary) {
    Array.from(document.body.classList).forEach(x => document.body.classList.toggle(x, !x.startsWith('pipboy-theme-')));
    document.body.classList.add(`pipboy-theme-${to}`);
    if (!temporary) { PipBoyTheme.actual = to; }
  },

  revertTemporary: function() { PipBoyTheme.set(PipBoyTheme.actual, false); }
};

const Notifications = {
  add: function(msg) {
    const elem = document.createElement('div');
    elem.classList.add('notification');

    const text = document.createElement('span');
    text.innerText = msg;
    elem.append(text);

    const container = document.getElementById('notifications-container');
    container.append(elem);
    container.classList.remove('hidden');
  },

  clear: function() {
    const container = document.getElementById('notifications-container');
    while (container.children.length > 0) {
      container.children[0].remove();
    }
    container.classList.add('hidden');
  },

  set: function(msg) {
    Notifications.clear();
    Notifications.add(msg);
  }
};

const YouTube = {
  _player: null,
  finished: null,
  _finishedResolve: null,
  initialize: function() {
    YouTube.finished = new Promise((resolve) => this._finishedResolve = resolve);
  },
  setup: function() {
    YouTube._player = new YT.Player('player', {
      height: 390,
      width: 640,
      events: {
        'onReady': YouTube._onPlayerReady,
      },
      playerVars: {
        disablekb: 1,
      }
    });
  },
  _onPlayerReady: function() { YouTube._finishedResolve(); },

  play: function(videoID) {
    return new Promise((resolve) => {
      const clear = () => {
        YouTube._player.removeEventListener('onError', onError);
        YouTube._player.removeEventListener('onStateChange', onStateChange);
      };

      const onError = () => { clear(); resolve(true); }
      const onStateChange = (e) => {
        if (e.data === 0) { clear(); resolve(true); } // "Ended"
        if (e.data === 2) { clear(); resolve(false); } // "Paused"
      }

      YouTube._player.addEventListener('onError', onError);
      YouTube._player.addEventListener('onStateChange', onStateChange);
      YouTube._player.loadVideoById(videoID);
    });
  },

  stop: function() {
    YouTube._player.pauseVideo();
  },

  skipToEnd: function() {
    if (YouTube._player.getPlayerState() !== 1) { return; }

    YouTube._player.seekTo(YouTube._player.getDuration(), true);
  },
};

YouTube.initialize(); // We want to do this before YT even has a chance to load, hence why it's here
function onYouTubeIframeAPIReady() { YouTube.setup(); } // https://developers.google.com/youtube/iframe_api_reference#Requirements

const RadioStation = {
  /**
   * Song -> News -> Song -> ...
   *
   * Song = <<Specific/Generic> intro|null> -> Song
   *
   * News = {
   *     Generic = Intro -> News -> Outro
   * }
   */

  _get: function(station, type) {
    if (station[type].get) {
      return station[type].get();
    }

    const segment = Random.element(station[type].list);
    return {
      ...segment,
      intro: Random.bool() ? null : (segment.intro && Random.bool()) ? segment.intro : Random.element(station[type].genericIntros),
      outro: Random.bool() ? null : (segment.outro && Random.bool()) ? segment.outro : Random.element(station[type].genericOutros),
    };
  },

  _stations: {
    enclave: { // TODO
      music: {
        list: [
          {display: 'Samuel A. Ward - America the Beautiful',                main: 'AwFD3N0DYyo'},
          {display: 'William Steffe - The Battle Hymn of the Republic',      main: 'nFdMX38w53c'},
          {display: 'Dan Emmett - Dixie',                                    main: 'vE8z7dVuw_g'},
          {display: 'Rick Rhodes and Danny Pelfrey - Presidential Entrance', main: 'sQa7a0PEpMo'},
          {display: `Jacques Offenbach - Marines' Hymn`,                     main: 'Lw7YISDMG8I'},
          {display: 'John Philip Sousa - The Stars and Stripes Forever',     main: 'M7hsabsiq8Y'},
          {display: 'John Philip Sousa - The Washington Post',               main: 'BH8TS20y3ps'},
          {display: 'Dr. Richard Shuckburgh - Yankee Doodle',                main: 'uYi8sFeT3mM'},
        ],

        genericIntros: [],
        genericOutros: [],
      },

      news: {
        list: [
          {main: 'uytFKoygdrE'}, // Speech - Baseball
          {main: 'Mtec6KzltwM'}, // Speech - Rebuild the Capital Wasteland
          {main: 'RWVvJ0awR8Q'}, // Speech - My Presidency
          {main: '_q5PZtp134U'}, // Speech - Let's Take a Tally
          {main: 'cvqo2liiDiE'}, // Speech - Children of the Wasteland
          {main: 'JhXsS9AN4iY'}, // Speech - Let's Talk About Government
          {main: '4Mn4kpD5U3Q'}, // Speech - Water, Water Everywhere
          {main: 'q9kQ3T0SZkY'}, // Speech - The Colonel's Restoration
          {main: 'QnmIiXygUxc'}, // Speech - We Are At War
          {main: '062EiIfRMmc'}, // Quote - "... never be destroyed ..." - Abraham Lincoln
          {main: 'x77k6LgKQ2c'}, // Quote - "... destroy my enemies ..." - Abraham Lincoln
          {main: '9WpWksP2IrQ'}, // Quote - "Everybody likes a compliment" - Abraham Lincoln
          {main: 'mZUMuidm2NQ'}, // Quote - "Avoid popularity if you would have peace" - Abraham Lincoln
          {main: 'gEJklTlYd2M'}, // Quote - "... do a job right ..." - Martin Van Buren
        ],

        genericIntros: [
          // null, // From the mouth
          // null, // The voice of america
          // null, // Warmth and reason
          // null, // of your heart
          // null, // with your host - me!
          // null, // It's time we had a talk
          // null, // Hoping we could talk
          // null, // Have a chat
          // null, // Let's chat
          // null, // Like to chat
          // null, // Some things we should talk about
        ],

        genericOutros: [
          // null, // Reflect
          // null, // Farewell
          // null, // We must part
          // null, // So remember
          // null, // We've got to part now
          // null, // Until next time - President
          // null, // Until next time - John
          // null, // Until next time - President John
          // null, // Until we meet again - President
          // null, // Until we meet again - John
          // null, // Until we meet again - President John
        ],
      },
    },

    gnr: { // TODO
      music: {
        list: [
          {display: 'Tex Beneke - A Wonderful Guy',                          intro: 'F7noUPUl2_g', main: 'vY8UUmIeoPQ'},
          {display: 'Cole Porter - Anything Goes',                           intro: 'PHw4L70F3f0', main: 'dxCjpEc66Dw'},
          {display: 'Sid Phillips - Boogie Man',                                                   main: '2x-xqjrp-f0'},
          {display: 'Roy Brown - Butcher Pete (Part 1)',                     intro: 'lC47eohxTVU', main: 'DD2qpctTR9o'},
          {display: 'Danny Kaye - Civilization (Bongo, Bongo, Bongo)',       intro: 'c154P9uFlIk', main: 'b8x0weOPhGc'},
          {display: 'Billie Holiday - Crazy He Calls Me',                    intro: 'jTrDyexv2WY', main: '1-qY58CB00U'},
          {display: 'Billie Holiday - Easy Living',                          intro: 'B9ej5s-BJvA', main: 'a2FeSEiXaR0'},
          {display: 'Gerhard Trede - Fox Boogie',                                                  main: '8d46qI1Ph5U'},
          {display: 'Bob Crosby and the Bobcats - Happy Times',              intro: 'xtXYGUWfVjw', main: 'qG4G_pUkd0s'},
          {display: `The Ink Spots - I Don't Want to Set the World on Fire`, intro: 'FV4gSnKMpeY', main: 'TmIwm5RElRs'},
          {display: `Jack Shaindlin - I'm Tickled Pink`,                                           main: 'cUuT379liW0'},
          {display: 'Ella Fitzgerald - Into Each Life Some Rain Must Fall',  intro: 'YgU_f_MOxrY', main: 'fEzzd-6tX1k'},
          {display: 'Billy Munn - Jazzy Interlude',                                                main: '4Nf1KxOAlug'},
          {display: 'Gerhard Trede - Jolly Days',                                                  main: '6qtMHIvBL5E'},
          {display: `Jack Shaindlin - Let's Go Sunning`,                                           main: 'xnwNxAYAcNU'},
          {display: 'The Ink Spots - Maybe',                                 intro: 'vCcY5q-oDHE', main: 'Wd_fO_SUgPs'},
          {display: 'Roy Brown - Mighty, Mighty Man',                        intro: '2t6UL8KrAew', main: 'iMmribsb8bc'},
          {display: 'Eddy Christiani - Rhythm for You',                                            main: 'JAkaA6V3Gxo'},
          {display: 'Allan Gray - Swing Doors',                                                    main: 'MKBSAzpyBzk'},
          {display: 'Bob Crosby and the Bobcats - Way Back Home',            intro: 'c4fsx_wwPzU', main: 'DPkizW2SFSY'},
        ],

        genericIntros: [
          '-zYBIeP82PM', // Now... some music
          'CGjVitCtk6o', // And now... some music
        ],

        genericOutros: [],
      },

      news: {
        generic: {
          list: [
            {main: 'eoa8NHEqqwk'}, // BoS outcasts
            {main: 'TeuThtDR3uQ'}, // BoS propaganda
            {main: 'DJcN98GxSTk'}, // Evergreen mills
            {main: 'V2lvGzoTQfk'}, // Talon company
            {main: 'EgcI2gfpSDM'}, // Weather forecast
          ],

          genericIntros: [],
          genericOutros: [],
        },

        psa: {
          list: [
            {main: 'wL9gZAL7qYk'}, // Ghouls
            {main: 'Jkqqs4EzNfg'}, // Raiders
            {main: 'JPw8Cf4d97E'}, // Super mutants
            {main: 'Bw1spx3jW3U'}, // Repairs
            {main: 'cBWn9PjsnZ0'}, // Yao Guai
            {main: 'sTZFpZb6pWg'}, // Radiation
          ],

          genericIntros: [
            // null, // Time for PSA
            // null, // Listen close for PSA
            // null, // Up next - PSA
            // null, // Super important PSA
          ],
          genericOutros: [],
        },

        player: {
          list: [

          ],

          genericIntros: [],
          genericOutros: [],

          // get: function() {
          //   // TODO - Player karma, completed quests, etc.
          // },
        },

        drama: {
          list: [
            // {main: ''}, // Escape from Paradise Falls!
            // {main: ''}, // Super Mutant Mayhem!
            // {main: ''}, // In the Black Widow's Web!
            // {main: ''}, // Between Rockopolis and a Hard Place!
          ],

          get: function() { return Random.element(RadioStation._stations.gnr.news.drama.list); },
        },

        genericIntros: [ // Useable across multiple news types
          // null, // Disc jockey
          // null, // That's that OTHER radio station
          // null, // Stupefied
          // null, // Enclave fakeout
          // null, // Ain't life grand?
          // null, // One dog ain't enough
          'LLd7WO5OND0', // Voice in the darkness
          // null, // Loud and proud
          'hhwRg5oMJQQ', // Wake up, wasteland!
          // null, // Lord and master
          // null, // All you need to know
          'wBJPR-bnppA', // What's up, Wastelanders?
          // null, // Post-apocalyptia
          // null, // And here's me!
          // null, // Time for the news
          // null, // Regularly scheduled program
          // null, // News time, children
          // null, // Bit of news
          // null, // Cashews
          // null, // Salisbury steak
          // null, // Global peace forever
          // null, // Ready? Me neither
        ],

        genericOutros: [ // Useable across multiple news types
          'QVPOwV1L6TY', // Thanks for listening, children
          'KEpqDNbIAx8', // Now matter how bad it hurts
        ],

        get: function() {
          const station = RadioStation._stations.gnr.news[Random.element(['generic', 'psa'/*, 'player'*//*, 'drama'*/])];
          if (station.get) {
            return station.get();
          }

          const segment = Random.element(station.list);
          return {
            ...segment,
            intro: Random.bool() ? null : (segment.intro && Random.bool()) ? segment.intro : Random.element([...station.genericIntros, ...RadioStation._stations.gnr.news.genericIntros]),
            outro: Random.bool() ? null : (segment.outro && Random.bool()) ? segment.outro : Random.element([...station.genericOutros, ...RadioStation._stations.gnr.news.genericOutros]),
          };
        },
      },
    },

    agatha: {
      music: {
        list: [
          {display: 'Antonín Dvořák - Adagio ma non troppo - Violin Concerto in A Minor',  main: '8DzVYYutjGg'},
          {display: 'Antonín Dvořák - Allegro ma non troppo - Violin Concerto in A Minor', main: 'ofibqIRRVyE'},
          {display: 'Johann Sebastian Bach - Gigue - Partita No. 3',                       main: 'BkQVSi7osLU'},
          {display: 'Johann Sebastian Bach - Grave - Sonata No. 2',                        main: 'UofDNY2see4'},
          {display: 'Johann Sebastian Bach - Preludio - Partita No. 3',                    main: 'FAq84oYy03g'},
          {display: 'Pablo de Sarasate - Zigeunerweisens',                                 main: 'YX1faNhbZ2Y'},
          {display: 'Heather MacArthur - Violin Noodling 1',                               main: '1eKGLe5KDVE'},
          {display: 'Heather MacArthur - Violin Noodling 2',                               main: '5giYtf2GTYk'},
          {display: 'Heather MacArthur - Violin Noodling 3',                               main: 'mYJKe3mzHJQ'},
          {display: 'Heather MacArthur - Violin Noodling 4',                               main: 'dyYpa8VnPJA'},
          {display: 'Heather MacArthur - Violin Noodling 4',                               main: 'dyYpa8VnPJA'},
          {display: 'Heather MacArthur - Violin Noodling 5',                               main: 'LRvmpY3z9OE'},
          {display: 'Heather MacArthur - Violin Noodling 6',                               main: 'LTUJPaItKVc'},
        ],

        genericIntros: [
          // Shoutout to https://www.youtube.com/playlist?list=PL27RNMmzo_3FNPqW_3OvtoguWHvjiGWky
          'EFQFDoCqXuY', // Crow
          'M_IBYVPfh84', // Player, lonely wanderer
          '2a5S4x6MyWM', // Healthy and happy
          'ofR082lbmvU', // Better place
          'T3_Gc3W1mY8', // Husband
          'swbzn1U9L_w', // Friendship is like a violin
          'lnzW_gjsys8', // Music important part of life
          'h4qG_gArRk8', // Cold nights
          '8dffntgyfn4', // Crazy Wolfgang
          'JWWdwjG5Bzs', // Amazing imagination

          '0XYXPaSXO5k', // Doc Hoff
          'PACKdCoq8Xs', // Player, thank you
          'msc4h2444PQ', // Poor old lady
          'esvOlthws9A', // Mother
          'TwVsBFRLiU0', // Help out those in need
        ],

        genericOutros: [],

        get: function() {
          const segment = Random.element(RadioStation._stations.agatha.music.list);
          return {
            ...segment,
            intro: Random.element(RadioStation._stations.agatha.music.genericIntros),
          };
        },
      },

      news: {
        get: function() { return {}; },
      },
    },

    mojave: {
      music: {
        list: [
          {display: 'Marty Robbins - Big Iron',                                              main: 'pPArO-OI_3U'},
          {display: `Darrell Wayne Perry and Tommy Smith - Goin' Under`,                     main: 'e2vSaOCAp0M'},
          {display: 'Guy Mitchell - Heartaches by the Number',                               main: 'Zr6k3mvZRQA'},
          {display: `The Roues Brothers - I'm Movin' Out`,                                   main: 'DMjBnLN2_ME'},
          {display: `Katie Thompson - I'm So Blue`,                                          main: 'Kp9hIeC828o'},
          {display: 'Lost Weekend Western Swing Band - In the Shadow of the Valley',         main: '9lrWx7-PiUM'},
          {display: `Eddy Arnold - It's a Sin`,                                              main: 'NdTe_sykyvU'},
          {display: `The Ink Spots - It's a Sin to Tell a Lie`,                              main: 'eP9nD0TsqEI'},
          {display: 'Peggy Lee - Johnny Guitar',                                             main: 'IeCWuN0dc5w'},
          {display: `Lost Weekend Western Swing Band - Let's Ride Into the Sunset Together`, main: 'OD4hSJybyCY'},
          {display: 'Lost Weekend Western Swing Band - Lone Star',                           main: 'Op8T7MltzbU'},
          {display: 'Johnny Bond - Stars of the Midnight Range',                             main: 'IXcZemHTOkk'},
          {display: 'Bert Weedon - Happy Times',                                             main: '1Qye2uNicbY'},
          {display: 'Bert Weedon - Lazy Day Blues',                                          main: 'DVzUAqbAaaw'},
          {display: 'Bert Weedon - Roundhouse Rock',                                         main: 'PemXuiZ0iAc'},
        ],

        genericIntros: [],
        genericOutros: [],
      },

      news: {
        get: function() { return {}; },
      },
    },

    new_vegas: { // TODO
      music: {
        list: [
          {display: `Dean Martin - Ain't That a Kick in the Head?`,                                   main: 'vaj6YGOLskQ'},
          {display: 'Marty Robbins - Big Iron',                                                       main: 'pPArO-OI_3U'},
          {display: 'Frank Sinatra - Blue Moon',                                intro: 'xRsr4SxebhI', main: 'GD6PreqIz6o'},
          {display: 'Guy Mitchell - Heartaches by the Number',                                        main: 'Zr6k3mvZRQA'},
          {display: `The Ink Spots - It's a Sin to Tell a Lie`,                 intro: 'oysgsmX_Jks', main: 'eP9nD0TsqEI'},
          {display: 'The Kay Kyser Orchestra - Jingle, Jangle, Jingle',                               main: 's0ofuXYkYi0'},
          {display: 'Peggy Lee - Johnny Guitar',                                                      main: 'IeCWuN0dc5w'},
          {display: 'Nat King Cole - Love Me as Though There Were No Tomorrow',                       main: 'zJP_kokzcxg'},
          {display: 'Carmen Dragon and his Orchestra - Mad About the Boy',                            main: 'kgOkwV5xX8w'},
          {display: 'Pete Thomas - Sit and Dream',                                                    main: 'VcLk3fQ3Zwg'},
          {display: `Bing Crosby - Something's Gotta Give`,                                           main: '5K7Q409AWKk'},
          {display: 'Jeff Hooper - Where Have You Been All My Life?',                                 main: 'Zi2mbSG609Q'},
          {display: `The Dave Barbour Quartet - Why Don't You Do Right?`,                             main: '4uTcw_A80Bo'},
          {display: 'Gerhard Trede - American Swing',                                                 main: '58MZ8ECtPTw'},
          {display: 'Gerhard Trede - Hallo Mister X',                                                 main: 'M_hUepNd52Q'},
          {display: 'Gerhard Trede - Manhattan',                                                      main: 'AIRcTm8fiHU'},
          {display: 'Gerhard Trede - Slow Bounce',                                                    main: '8gJv_NdTyZ0'},
          {display: 'Gerhard Trede - Strahlende Trompete',                                            main: 'hXTT8ZkwJ_o'},
          {display: 'Gerhard Trede - Von Spanien Nach Südamerika',                                    main: 'pHSD_SzOBHM'},
        ],

        genericIntros: [
          // Shoutout to https://www.youtube.com/@roetheboat1/videos
          'NsfHZq2R4-o', // From me, to you
          '4ui4lB5_hr8', // One of my favorite songs
          'nkU5_zphfi4', // Classics coming right up
        ],

        genericOutros: [],
      },

      news: {
        generic: {
          list: [
            // {main: ''}, // Bitter Springs
            // {main: ''}, // Camp Golf
            // {main: ''}, // Jacobstown
            // {main: ''}, // Lee Oliver
            // {main: ''}, // NCR Correctional Facility
            // {main: ''}, // Nipton
            // {main: ''}, // Shot in the head
          ],

          genericIntros: [],
          genericOutros: [],
        },

        player: {
          list: [

          ],

          genericIntros: [],
          genericOutros: [],
        },

        genericIntros: [
          // Shoutout to https://www.youtube.com/@roetheboat1/videos
          // null, // Best looking audience
          'XKBBtOHIfGE', // Charisma
          // null, // Coming on too strong
          // null, // Extraordinarily beautiful
          // null, // Fanning the flames
          // null, // Filling in
          // null, // Get you some news
          'EwDrmA6Fuic', // Good feeling
          // null, // Got news for you
          // null, // I love you
          // null, // If you like the news
          // null, // Jukebox
          // null, // Magic in the air
          // null, // More news for you
          // null, // Mrs. New Vegas
          // null, // News bring us closer
          // null, // Newsman fedora
          // null, // No news is good news
          '-CGclHVZ_v0', // Nuclear Winter Wonderland
          'kSuC8P4zS74', // Thank you for listening
          // null, // The right place
          '1RM3uEnQ24E', // Wonderful in your own way
          'mkOZH_DOJhc', // You're all so great
        ],

        genericOutros: [
          // Shoutout to https://www.youtube.com/@roetheboat1/videos
          'CHcM7FOn7G8', // Sponsor - Gomorrah
          'oyu_xylWVfg', // Sponsor - Primm
          // null, // Sponsor - Silver Rush
          'XuYAQIGlxj0', // Sponsor - The Tops
          '0Vl9s8rsjQg', // Sponsor - Ultra-Luxe
          // null, // Sponsor - Vault 21
          'Z1JJTdQdQUY', // Sponsor - Vikki and Vance
        ],

        get: function() {
          return {
            intro: Random.bool() ? null : Random.element(RadioStation._stations.new_vegas.news.genericIntros),
            outro: Random.bool() ? null : Random.element(RadioStation._stations.new_vegas.news.genericOutros),
          };
          // TODO
          const station = RadioStation._stations.new_vegas.news[Random.element(['generic', 'player'])];
          const segment = Random.element(station.list);
          return {
            ...segment,
            intro: Random.bool() ? null : (segment.intro && Random.bool()) ? segment.intro : Random.element([...station.genericIntros, ...RadioStation._stations.new_vegas.news.genericIntros]),
            outro: Random.bool() ? null : (segment.outro && Random.bool()) ? segment.outro : Random.element([...station.genericOutros, ...RadioStation._stations.new_vegas.news.genericOutros]),
          };
        },
      },
    },

    black_mountain: {
      music: {
        list: [
          {display: 'Marty Robbins - Big Iron',                                              main: 'pPArO-OI_3U'},
          {display: `Darrell Wayne Perry and Tommy Smith - Goin' Under`,                     main: 'e2vSaOCAp0M'},
          {display: 'Guy Mitchell - Heartaches by the Number',                               main: 'Zr6k3mvZRQA'},
          {display: `The Roues Brothers - I'm Movin' Out`,                                   main: 'DMjBnLN2_ME'},
          {display: `Katie Thompson - I'm So Blue`,                                          main: 'Kp9hIeC828o'},
          {display: 'Lost Weekend Western Swing Band - In the Shadow of the Valley',         main: '9lrWx7-PiUM'},
          {display: `Eddy Arnold - It's a Sin`,                                              main: 'NdTe_sykyvU'},
          {display: `The Ink Spots - It's a Sin to Tell a Lie`,                              main: 'eP9nD0TsqEI'},
          {display: 'Peggy Lee - Johnny Guitar',                                             main: 'IeCWuN0dc5w'},
          {display: `Lost Weekend Western Swing Band - Let's Ride Into the Sunset Together`, main: 'OD4hSJybyCY'},
          {display: 'Lost Weekend Western Swing Band - Lone Star',                           main: 'Op8T7MltzbU'},
          {display: 'Johnny Bond - Stars of the Midnight Range',                             main: 'IXcZemHTOkk'},
          {display: 'Bert Weedon - Happy Times',                                             main: '1Qye2uNicbY'},
          {display: 'Bert Weedon - Lazy Day Blues',                                          main: 'DVzUAqbAaaw'},
          {display: 'Bert Weedon - Roundhouse Rock',                                         main: 'PemXuiZ0iAc'},
        ],

        genericIntros: [],
        genericOutros: [],
      },

      news: {
        list: [
          // Shoutout to https://www.youtube.com/playlist?list=PLEjatrSrdj1wJ0VwbpnItpmgASi368nd7
          {main: 'tI806-0HHxo'}, // Today you die, Raul!
          {main: 'PpDnRXk3Jr4'}, // This time you will get it done, Raul!
          {main: '49lpaLqtYao'}, // True eye seeing time!
          {main: '48WzretaIJI'}, // The nightkin
          {main: 'JOvCBTdMH60'}, // First gen super mutants
          {main: 'XPI8xCzQSZE'}, // Dumb-dumbs
          {main: 'CxKf5_heoos'}, // Beware the battle cattle
          {main: 'K44wz1t7Nbc'}, // The good old days
          {main: 'gzcRsYVvSug'}, // Humans? Here?
          {main: 'kHPpWpMYYdw'}, // STAY THE HELL AWAY
          {main: 'zHvFJsoHzAs'}, // Inferior, frail creatures
          {main: 'ReHbwlGHeck'}, // Battle cattle should be fought ferociously
        ],

        genericIntros: [],
        genericOutros: [],
      },
    },
  },

  stop: function() { YouTube.stop(); },
  play: function(which) {
    RadioStation.stop();
    void RadioStation._play(RadioStation._stations[which]);
  },

  _play: async function(station) {
    let type = 'music';

    while (true) {
      const segment = RadioStation._get(station, type);

      if (segment.intro) {
        const shouldContinue = await YouTube.play(segment.intro);
        if (!shouldContinue) { return; }
      }

      if (segment.main) {
        if (segment.display) { Notifications.set(`Playing: "${segment.display}"`); }
        const shouldContinue = await YouTube.play(segment.main);
        if (segment.display) { Notifications.clear(); }
        if (!shouldContinue) { return; }
      }

      if (segment.outro) {
        const shouldContinue = await YouTube.play(segment.outro);
        if (!shouldContinue) { return; }
      }

      type = (type === 'music') ? 'news' : 'music';
    }
  },
};

const SFX = {
  'pipboy-btn_click': new Audio('res/sfx/pipboy-btn_click.wav'),
  'menu-item_hover': new Audio('res/sfx/menu-item_hover.wav'),
  'menu-item_click': new Audio('res/sfx/menu-item_click.wav'),
};

window.addEventListener('DOMContentLoaded', async () => {
  PipBoyTheme.set('green', false);

  Notifications.set('Loading...');

  await YouTube.finished;

  Array.from(document.querySelectorAll('.pipboy-btn:not(.disabled)')).forEach((btn) => {
    btn.addEventListener('click', function(e) {
      if (e.target.classList.contains('selected')) { return; }

      const previous = document.querySelector(`.pipboy-btn.selected`);
      if (previous) {
        previous.classList.remove('selected');
        document.getElementById(previous.getAttribute('mapping')).classList.add('hidden');
      }

      e.target.classList.add('selected');
      document.getElementById(e.target.getAttribute('mapping')).classList.remove('hidden');
      SFX['pipboy-btn_click'].play();
    });
  });

  Array.from(document.querySelectorAll('#screen .item')).forEach((item) => {
    item.addEventListener('mouseover', () => {
      if (item.hasAttribute('theme')) { PipBoyTheme.set(item.getAttribute('theme'), true); }
      SFX['menu-item_hover'].play();
    });

    item.addEventListener('mouseout', function() { PipBoyTheme.revertTemporary(); });

    item.addEventListener('click', () => {
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        if (item.hasAttribute('station')) { RadioStation.stop(); }
      } else {
        item.parentElement.getElementsByClassName('selected')[0]?.classList.remove('selected');
        item.classList.add('selected');
        if (item.hasAttribute('theme')) { PipBoyTheme.set(item.getAttribute('theme'), false); }
        if (item.hasAttribute('station')) { RadioStation.play(item.getAttribute('station')); }
      }

      SFX['menu-item_click'].play();
    });
  });

  Array.from(document.querySelectorAll('#screen .bottom-bar .selectable')).forEach((clickable) => {
    clickable.addEventListener('mouseover', () => {
      SFX['menu-item_hover'].play();
    });

    clickable.addEventListener('click', () => {
      const previous = clickable.parentElement.getElementsByClassName('selected')[0];
      if (previous === clickable) { return; }
      if (previous) {
        previous.classList.remove('selected');
        document.getElementById(previous.getAttribute('mapping')).classList.add('hidden');
      }
      clickable.classList.add('selected');
      document.getElementById(clickable.getAttribute('mapping')).classList.remove('hidden');

      SFX['menu-item_click'].play();
    });
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
      YouTube.skipToEnd();
    }
  });

  Notifications.clear();
});