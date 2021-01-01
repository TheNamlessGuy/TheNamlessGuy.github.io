const SAVE_SEPARATOR = ':';
const TITLE_BASE_NAME = '';
const BASE_PAGE_TITLE = 'YouTube player - Namless Things';

/*
TODO:
- Fix minus then plus fucking up indexing somehow
- Only Play button/k should be able to play video. If changing videos and it wasn't playing before, don't start.
- Escape " in JS bookmark save
- Loop 'dont' sets load to 0 on firefox page refresh (not reload, but when close->open)?

Plugin TODO:
- Convert ctrl + click => new tab
- Close popup after button press ALWAYS
*/

const DEFAULT_VIDEOS = [
  'dQw4w9WgXcQ', // Never Gonna Give You Up
  '90qT9ZNy2bo', // Wii Shop Channel Music and there is absolutely nothing wrong with it whatsoever
  'lXMskKTw3Bc', // Never Gonna Hit Those Notes
  'ykwqXuMPsoc', // Narwhals
  'NN75im_us4k', // Never Gonna Give Your Teen Spirit Up
  '4WgT9gy4zQA', // Ultimate showdown
  'k85mRPqvMbE', // Crazy Frog - Axel F
  'astISOttCQ0', // The Gummy Bear Song
  'N_x72hA7_SY', // Dragonstea Din Tei (Numa Numa)
  'J_DV9b0x7v4', // Caramelldansen
  'J---aiyznGQ', // Keyboard Cat (RIP)
  'wGlBwW7f5HA', // ( ͡° ͜ʖ ͡°)
  '1wnE4vF9CQ4', // Ieva's Polka (Leek Spin)
  'p3G5IXn0K7A', // Hamsterdance
  'QH2-TGUlwu4', // Nyan Cat
  'q6EoRBvdVPQ', // YEEEEEEE
  'Y4QGPWLY-EM', // YO LISTEN UP HERE'S A STORY
  'EwTZ2xpQwpA', // Chocolate Rain
  'iEXPkv7lJgc', // We Are Number One (RIP)
  'Z3ZAGBL6UBA', // It's peanut butter jelly time (sorry)
  'uE-1RPDqJAY', // My childhood (They're taking the hobbits to Isengard)
  'qmjOd9Dlr34', // Trololololololololo
  'aKULi72yUko', // Manamanah
  'eDU0CTDMk2g', // Do You Like Waffles?
  'kFF3pVOHtoA', // Schfifty Five
  'ENnAa7rqtBM', // Everyone else has had more sex than me (unrelated but it's also the song title)
  'QTqD7I3Dksw', // Up butt coconut
  'KMYN4djSq7o', // The Llama Song
  'UcwfEMdV-aM', // MY ANUS IS BLEEDING
  'c71RCAyLS1M', // Living in the Sunlight
  'HEXWRTEbj1I', // Vladislav
  '5xxQs34UMx4', // The Shrek Song
  'y6120QOlsfU', // That one song no one can ever remember the name of
  'y983TDjoglQ', // HOW COULD THIS HAPPEN TO MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
  'ZZ5LpwO-An4', // The He-man song
  'TKfS5zVfGBc', // free cheat codez for gta:sa realy easy!!
  'thhaf-bKWyg', // The inferior version of HOW COULD THIS HAPPEN TO MEEEEEEEEEEEEEEEEEEEEEEEEEEE
  'Ijhhe8Q_dQs', // The most inspiring song ever
  'ahdH8eTydWY', // Ladies and gentlemen, we got 'em
  'UcLph-scF-0', // Blue eyes white skeleton song
  'E9s1ltPGQOo', // It's just the Mii Channel music
  'ygI-2F8ApUM', // Superior LOTR (Brodyquest)
  'AO6ePzKVeuE', // Hey wanna go shopping with Mr Skeltal?
  '0L_kQ_wbsAM', // A singular doot
  'Oa-ae6_okmg', // For when you are surrounded by faces that are familiar
  '4zLfCnGVeL4', // Hola oscuridad, mi viejo amigo
  'rvrZJ5C_Nwg', // Old man yells at mountain
  'j6KnvkEPAZg', // Big Iron
  'feA64wXhbjo', // Gunfire at the Oscars
  '-1dSY6ZuXEY', // Spooky Scary Skeletons
  '4aneAWxzOUk', // Don't Stop Me (from hitting those notes) Now
  '5FjWe31S_0g', // Fuck this shit I'm out
  'djV11Xbc914', // Take On Me (it's a meme if you count the WHEN YOU X WITH YOUR MATES videos)
  '1vrEljMfXYo', // Take Me Home, Country Roads
  'umAL-6-j1Ew', // That one really annoying one
  'aQkPcPqTq4M', // 𝒶 𝑒 𝓈 𝓉 𝒽 𝑒 𝓉 𝒾 𝒸
  'U06jlgpMtQs', // For when you bleed red
  'aiSdTQ9DW9g', // Rasputin
  'dP9Wp6QVbsk', // Die Woodys
  'izGwDsrQ1eQ', // Winking emoji
  'PGNiXGX2nLU', // The Beyblade song
  'Hy8kmNEo1i8', // The poop fetishist
  '6W5pq4bIzIw', // Boombastic
  '6E5m_XtCX3c', // Ocean Man
  'vTIIMJ9tUc8', // Tunak Tunak Tun
  'SDklocLs8mU', // Early 2000s emo kid anthem
  'K5tVbVu9Mkg', // Cook by the book, bitch
  'fbGkxcY7YFU', // What What (in the Butt)
  'gy1B3agGNxw', // Epic Sax Guy
  'kfVsfOSbJY0', // That one between Thursday and Saturday
  '9bZkp7q19f0', // Gangnam style
  'AZFuvVdIgSw', // Rappin' For Jesus
  'jofNR_WkoCE', // They bark jesus christ they're basically dogs what did you expect
  '9FISHEO3gsM', // Rebecca Dylan
  '-TTgXfO7CRI', // S3RLY Astley
  'SQTcRxPsoMo', // MTC
  '8d44ykdKvCw', // VI SITTER HÄR I VENTEN
  'tesr1OyymXo', // 100 miles
];