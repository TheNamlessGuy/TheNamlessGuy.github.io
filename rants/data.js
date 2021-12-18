const _raw_data = [
//////////////////
// Why fantasy? //
//////////////////
{
  'title': 'Why fantasy?',
  'content': [
    `I would argue that, when it comes to fiction, there are three genres that represent the best the medium has to offer: fantasy, science fiction, and horror.
    Each of these give something special to the medium that the others cannot capture as well.`, {type: 'break'},
    `Horror is probably the easiest to explain, given that the clue is in the name: the best works in the genre have always been about exploring the depths of human dread.
    Famous works would include Mary Shelley's Frankenstein, Bram Stoker's Dracula, pretty much all of H.P. Lovecraft's works, and arguably most cautionary tales such as
    Aesop's Fables, along with any given story by the Brothers Grimm. Of course, some of these represent what I'm trying to convey better than others,
    so I'll focus on one to begin with: Lovecraft.`, {type: 'break'},
    `Most (if not all) of Lovecraft's works revolve around two ideas: the insignificance of humans in the eye of the cosmos, and/or
    (on the opposite side of things) the fact that humans, quite innately, fear the unknown. While a small piece of it, this represents the type of subject matter the horror
    genre is the best tool for exploring: horror (like I said, the clue is in the name).`, {type: 'break'},
    {type: 'break'},
    `In the same vein, sci-fi has traditionally explored societal and large-scale issues facing all of humanity. For example,
    'Do Androids Dream of Electric Sheep?' questions what it truly means to be human, and through that also discusses racism (albeit on a fairly abstract level).
    1984 discusses the dangers of letting the state get too much power over the common man. Starship Troopers (the book) advocates for the need for war.
    Of course, you do not need to agree with the sentiments of all of these stories, but the ideas are still there.`, {type: 'break'},
    {type: 'break'},
    `Fantasy, on the other hand, has in the modern day mostly been associated with `, {type: 'link', title: `The Hero's Journey`, link: 'https://www.youtube.com/watch?v=1xHsAMik9VM'},
    ` type stories. Fantasy can absolutely shine in these types of stories, but it is far from the only thing it can do. For example, take the old tales of Norse mythology:
    To someone who doesn't believe in the religion itself, they are at the end of the day fantasy stories. While it's true that a lot of them `, {content: 'do', classes: ['italic']},
    ` follow the trend of The Hero's Journey, a lot of them do not (or not exclusively). It's in these segments where I feel fantasy shines the brightest, as
    we get to explore more of the emotional and/or spiritual sides of humanity.`,
    `This is the type of fantasy I want to explore. Of course, there are other sides of it that are important to me as well (building a world that seems grand and magical,
      yet still realistic, for example), this is the main reason I prefer fantasy over the other genres mentioned.`
  ],
},
///////////////////////////////////
// My Dream Programming Language //
///////////////////////////////////
{
  'title': 'Programming language features',
  'content': [
    `Often when I'm coding, I find something that I want to be able to do, but I can't do it cleanly due to the design of the language. This is a list of such features.`, {type: 'break'},
    {type: 'toc'},
    {type: 'title', title: 'Features all languages should have', level: 2, anchored: true, classes: ['italic']},
    `Things I've encountered in some languages, or things I would really just want to be able to do`,

    {type: 'title', title: 'Function parameter constants', level: 3, anchored: true, classes: ['underlined']},
    `I stole this one from Erlang, although it probably exists in other languages. Basically, say you have a function like this:`,
    {type: 'code-block', language: 'psuedo', code: `
func myCoolFunc(int param, bool reversed) {
  if (reversed) {
    cFunc(param);
    bFunc(param);
    aFunc(param);
  } else {
    aFunc(param);
    bFunc(param);
    cFunc(param);
  }
}
`},
    `A dumb example, but it serves its purpose. Now, imagine you could write it like this instead:`,
    {type: 'code-block', language: 'psuedo', code: `
func myCoolFunc(int param, true) {
  cFunc(param);
  bFunc(param);
  aFunc(param);
}

func myCoolFunc(int param, false) {
  aFunc(param);
  bFunc(param);
  cFunc(param);
}
`},
    `See how `, {content: 'objectively', classes: ['italic']}, ` better that is?`,

    {type: 'title', title: 'Default function parameter values', level: 3, anchored: true, classes: ['underlined']},
    `Please and thank you.`,
    {type: 'code-block', language: 'psuedo', code: `
func cool(int param = 0) {
  // ...
}
`},

    {type: 'title', title: 'Python-style parameter specification', level: 3, anchored: true, classes: ['underlined']},
    `In python you can specify a parameter out of order by referencing it by name. This is a very useful idea.`,
    {type: 'code-block', language: 'psuedo', code: `
func cool(int param1 = 0, param2 = 0) {
  // ...
}
cool(param2 = 1);
`},

    {type: 'title', title: 'Scope creation control', level: 3, anchored: true, classes: ['underlined']},
    `I often find myself thinking that I want to break code out to a function in order to make it more readable, but this will come at a runtime cost of a scope creation,
    which isn't great. Granted, that's not really a huge major issue that every language immediately needs to turn their attention to,
    but that's what got me to start thinking about it. There are four types of scopes the programmer should be able to create:`,
    {type: 'ul', elements: [
      'No scope - Simply don\'t open a new scope when entering the code block',
      'Closed scope - The code block can\'t access anything declared outside of it',
      'Open declaration scope - The code block has its own scope, but can access things declared in the scope(s) above where it was created',
      'Open call scope - The code block has its own scope, but can access things declared in the scope(s) above where it was called',
    ]},
    `The 'no scope' one fixes the original issue I experienced. With this I would no longer feel bad anytime I need to write a 'random number between' function.
    This can of course be used as a 'injectable' code block as well (which is basically the same thing but the phrasing makes me think of other scenarios it could be used).`, {type: 'break'},
    `The 'closed scope' is good in a few scenarios. Callback functions not holding the exact scope they were created in hostage until they get discarded
    (JavaScript developers probably understand this, as this is basically the issue with 'arrow functions'), and it should probably be used in most for-loops and such.`, {type: 'break'},
    `"Oh but what if I want to use only one or two variables from the above scope?", you may be asking. This is where we yoink the `, {type: 'code', code: 'use()'}, ` syntax from PHP.`,
    {type: 'code-block', language: 'psuedo', code: `
int a = 5;
for (int i = 0; i < 10; ++i) use(a) {c
  a += i;
}
`},
    `This syntax obviously wouldn't work for closed scope functions, and I'm not sure how the syntax would look for that, but I figure it can't be difficult to solve. Perhaps:`,
    {type: 'code-block', language: 'psuedo', code: `
func myfunc() requires(a) {c
  for (int i = 0; i < 10; ++i) {
    a += i;
  }
}

int a = 5;
myfunc()(a);
`},
    `The 'open declaration scope' is basically what we are used to in most modern languages. This should probably be default.`, {type: 'break'},
    `The 'open call scope' is very specific when it needs to be used. Its usecase lies when you need an inline function that needs to create variables but shouldn't tarnish the 'parent' scope.`,

    {type: 'title', title: 'Conditional \'ternary\' operator but for non-value results', level: 3, anchored: true, classes: ['underlined']},
    `This sounds weird, but generally I stole it from bash: `, {type: 'code', language: 'bash', code: '[[ mybool ]] && echo "yes" || echo "no"', names: ['mybool']}, `. Granted,
    this isn't syntax you really should use out of really basic testing (in bash), but imagine if you could.`, {type: 'break'},
    `The more observant reader might have noticed I put ternary in quotations in the header for this section, and that's because (much like in bash) I
    figure you should also be able to do just the good or bad one, and have a noop otherwise. This is an example syntax:`,
    {type: 'code-block', language: 'psuedo', code: `
(mybool) ? doYesThing() : doNoThing();
(mybool) ? doYesThing();
(mybool) ?: doNoThing();
int myint = (mybool) ?: doNoThing(); // Should either result in syntax error, or have the value of myint persist when mybool == true
`},

    {type: 'title', title: 'Pointers/references and allowing the programmer to decide between pass-by-reference and pass-by-value', level: 3, anchored: true, classes: ['underlined']},
    `Most people in the business seem to have nightmares about pointers from back in their earlier programming days, but they are insanely useful from time to time.`, {type: 'break'},
    `I added the name 'reference', since you can pretty much abstract away the idea that it points to a memory address in most languages and have it change absolutely nothing.
    I prefer using the word 'reference', but that's mostly because the pointer syntax in C++ is absolute ass, while the reference syntax is how it should be.`, {type: 'break'},
    {type: 'break'},
    `The main point of this section isn't the actual pointers however, but what they let you as a programmer do: you get to decide whether you want to pass-by-reference or not.
    This is something most languages seem to want to absolutely fuck you over with. In my experience, most languages have pass-by-value sometimes and pass-by-reference in other
    cases, even if the syntax itself looks exactly the same. This is incredibly user-unfriendly, and I don't really understand why most people just roll over and accept it.
    It's probably the leading thing for any bugs I write or issues I face in those types of languages.`,
    {type: 'code-block', language: 'psuedo', code: `
// Disgusting! Ew! Spit on it! Ptooey
MyClass c = new MyClass(abacus = false);
func myfunc(MyClass c) {
  c.abacus = true;
}
myfunc(c);
print(c.abacus); // => true
`},
{type: 'code-block', language: 'psuedo', code: `
// Wonderful
MyClass c = new MyClass(abacus = false);
func myfunc(MyClass c) {
  c.abacus = true;
}
myfunc(c);
print(c.abacus); // => false
myfunc(&c);
print(c.abacus); // => true
`},

    {type: 'title', title: 'Constructors with return values', level: 3, anchored: true, classes: ['underlined']},
    `Basically, exceptions are bad and ugly, and we should use this instead. I'll let the code speak for itself on this one:`,
    {type: 'code-block', language: 'psuedo', code: `
// Good version
class MyClass {
  constructor(int inparam1, bool inparam2) {
    if (inparam1 > 5) {
      return null;
    }

    parent(); // Creates an object of type MyClass and sets it to this
    this.myint = inparam1;
    this.mybool = inparam2;
    return this;
  }
}

MyClass c = new MyClass(7, false);
if (c === null) {
  print('Uh oh, spaghetti-os');
}
`},
{type: 'code-block', language: 'psuedo', code: `
// Bad version
class MyClass {
  constructor(int inparam1, bool inparam2) {
    if (inparam1 > 5) {
      throw new YouDidItWrongException('inparam1 no bigger than 4 pls tanks');
    }
    this.myint = inparam1;
    this.mybool = inparam2;
  }
}

MyClass c; // We could at least get rid of this if we had scope control, see that subsection.
try {
  MyClass c = new MyClass(7, false);
} catch (YouDidItWrongException e) {
  print('You did it wrong');
}
`},

    {type: 'title', title: 'Multiple inheritances', level: 3, anchored: true, classes: ['underlined']},
    `I really don't see why this would be an issue ever. The biggest issue is the 'two parents have the same function' issue people keep bringing up,
    but the compiler should easily be able to see that any call to the function is ambiguous, and should then prompt you to specify which of them you are calling.`,
    {type: 'code-block', language: 'psuedo', code: `
class Parent1 {
  func foo() { /* ... */ }
};
class Parent2 {
  func foo() { /* ... */ }
};

class Child: Parent1, Parent2 {
  func bar() {
    foo(); // Compilation error
    Parent1::foo(); // Perfectly fine
  }
};
`},
    `Some languages work around this by use of interfaces (which isn't really a solution to the problem. Granted, it might not have been intended to be,
    but people keep saying it is), or traits.`, {type: 'break'},
    `I will say that traits are a step in the right direction, and is basically how inheritance should work from the get-go,
    but at least in my experience any language that has one also has the other, which is just incredibly redundant.`,

    {type: 'title', title: 'Events', level: 3, anchored: true, classes: ['underlined']},
    `Basically the only thing I liked about C# is that you can subscribe to a variable changing value, and influence said value.
    This would be great to use for something like a video game perk/status effect system.`,
    {type: 'code-block', language: 'psuedo', code: `
class DoubleIncome: Perk {
  // ...
  static onActivation() {
    onChange(player.money, func(value) {
      if (value < player.money) { return value; }
      return player.money + (value - player.money) * 2;
    });
  }
}
`},

    {type: 'title', title: '\'finally\' on all code blocks', level: 3, anchored: true, classes: ['underlined']},
    `Any time you open a connection to a server or some such and you need to shut it down at the end of a function,
    the only real choice you have is to wrap the function in a try-catch.`,
    {type: 'code-block', language: 'psuedo', code: `
func doTheThing() {
  Connection conn;
  try {
    conn = connect();
    // ...
  } finally {
    conn.close();
  }
}
`},
    `Obviously this is incredibly ugly. Now check a look at this:`,
    {type: 'code-block', language: 'psuedo', code: `
func doTheThing() {
  Connection conn = connect();
  // ...
} finally {
  conn.close();
}
`},
    {content: 'Hnnnnnnnnnnnnnnnnnnnng', classes: ['italic']}, `, as the kids say. Much cleaner. Of course, you should be able to do the same with if-statements, loops, etc.`, {type: 'break'},
    `I'd draw the line at class code blocks, since they're not really executed as much as evaluated. Perhaps if you wanted to execute some code after object creation?
    But given the constructor with return value thing from above, you could just put a finally on the constructor. Anyway,
    the same scenario but with a loop instead of a function:`,
    {type: 'code-block', language: 'psuedo', code: `
Connection conn = connect();
while (true) {
  // ...
} finally {
  conn.close();
}
`},

    {type: 'title', title: 'Labels', level: 3, anchored: true, classes: ['underlined']},
    `Labels in general are pretty good to use, at least when used in conjunction with `, {type: 'code', code: 'break'}, ` and `, {type: 'code', code: 'continue'}, `, etc.`,
    {type: 'code-block', language: 'psuedo', code: `
#outer while (true) {
  // ...
  #inner while (true) {
    if (/* ... */) {
      break #outer;
    }
  }
}
`},
    `For clarification, that `, {type: 'code', code: 'break'}, ` would get you out of both loops.`,
    `Now imagine if you could do it with `, {type: 'code', code: 'return'}, ` statements as well. This would be pretty useless without the `,
    {type: 'link', link: '#features-all-languages-should-have---finally-on-all-code-blocks', title: 'finally on all code blocks'}, ` from above.
    But with it, you could suddenly do a lot.`,
    {type: 'code-block', language: 'psuedo', code: `
func foo() {
  if (/* ... */) { return 1 #ret1; }
  if (/* ... */) { return 'abababbaba' #ret2; }
  if (/* ... */) { return 'bababaabab' #ret3; }
} finally #ret1 {
  // Handle ret1 specifically
} finally {
  // Handle all other cases
}
`},

    {type: 'title', title: '#define or other ways to declare compile-time variables', level: 3, anchored: true, classes: ['underlined']},
    {type: 'img', src: 'res/i-just-think-theyre-neat.jpg', classes: ['medium']},

    {type: 'title', title: 'Function overloading', level: 3, anchored: true, classes: ['underlined']},
    `Not gonna go too deep into this one, it should be obvious why it's useful. Especially with the `,
    {type: 'link', link: '#features-all-languages-should-have---function-parameter-constants', title: 'function parameter constants'}, ` mentioned above.`,

    {type: 'title', title: 'Objects/Hashmaps and JavaScript-style access syntax', level: 3, anchored: true, classes: ['underlined']},
    `If there's anything JS did right, it's the object access syntax. Allowing you do do the `, {type: 'code', code: 'dict[\'value\']'}, ` thing when you absolutely need to,
    but also giving you the freedom to make it actually readable with the `, {type: 'code', code: 'dict.value'}, ` syntax.`, {type: 'break'},
    `For this reason (and some others), I say all languages should have some sort of builtin hashmap (in its standard lib or not) and have the same syntax.
    While I can agree that the keys should be locked to strings for the sake of simplicity, the value should be whatever type you want it to be.`,

    {type: 'title', title: 'Multiple return values', level: 3, anchored: true, classes: ['underlined']},
    `It's just really useful. Steal the spreading syntax from any language that has it:`,
    {type: 'code-block', language: 'psuedo', code: `
func myfunc() {
  return [1, false];
}
[int a, bool b] = myfunc();
`},

    {type: 'title', title: 'Features no languages should have', level: 2, anchored: true, classes: ['italic']},

    {type: 'title', title: 'No public, protected, private, or similar', level: 3, anchored: true, classes: ['underlined']},
    `This is one of by biggest gripes. There are only two reasons you would ever set something as not public:`,
    {type: 'ul', elements: [
      'You do not trust the people who will interface with your code',
      'You think you are smarter than the people who will interface with your code',
    ]},
    `You should always trust the people that interface with your code, because it is purely their fault if they break something on their end.
    They shouldn't be messing with parts of your code that they do not understand. They should, however, be allowed to use any of your code if they do understand it.`, {type: 'break'},
    `The quality of your code is not tied to what people do with it. It stands on its own merit.`, {type: 'break'},
    {type: 'break'},
    `Now, you might still want to flag that a variable or a function isn't intended to be used outside unless you absolutely know what you're doing.
    This issue was solved by python programmers ages ago however: prefix the name with a '_'.`,

    {type: 'title', title: 'Typeless anything', level: 3, anchored: true, classes: ['underlined']},
    `No typeless variables, no typeless return values, etc.`, {type: 'break'},
    `Pretty sure this is one of the features with the highest bug creation amount.`,

    {type: 'title', title: 'Declaration and initialization/assignment syntax being the same', level: 3, anchored: true, classes: ['underlined']},
    `Looking at you, python.`,
    {type: 'code-block', language: 'psuedo', code: `
// Do this
int a = 5;
a = 10;
`},
{type: 'code-block', language: 'psuedo', code: `
// Not this
a = 5;
a = 10;
`},

    {type: 'title', title: 'Implicit pass-by-reference', level: 3, anchored: true, classes: ['underlined']},
    `100% for creating bugs, and has no other practical uses.`,

    {type: 'title', title: 'Indentation based code blocks', level: 3, anchored: true, classes: ['underlined']},
    {type: 'img', src: 'res/stop-it-get-some-help.jpg', classes: ['medium']},

    {type: 'title', title: '\'Weak\' comparison', level: 3, anchored: true, classes: ['underlined']},
    `This isn't really an issue if you follow the `, {type: 'link', title: 'no typelessness', link: '#features-no-languages-should-have---typeless-anything'}, ` rule.`,

    {type: 'title', title: 'Features that languages technically should have but that you should never ever use', level: 2, anchored: true, classes: ['italic']},

    {type: 'title', title: 'Redeclaring variables', level: 3, anchored: true, classes: ['underlined']},
    `Controversial, I know. But sometimes I need throwaway variables when debugging and I can't keep using `, {type: 'code', code: 'tmp'}, `.
    But in a typed language I might need it to be an int in one point of the code, and a string in another. Thus, redeclaration.`,

    {type: 'title', title: 'Nested ternary', level: 3, anchored: true, classes: ['underlined']},
    `It would be weird to restrict this, but at the same time it is so incredibly ugly that no one should ever use it, and people who do should be flayed.`,

    {type: 'title', title: 'Multilevel inheritance', level: 3, anchored: true, classes: ['underlined']},
    `Now, in some cases multilevel inheritance will actually improve your code, which is why I put this in this category.
    But if you've ever spent any time with a hardcore Java programmer (or just OOP in general), you'll probably understand why I absolutely loathe this concept.`, {type: 'break'},
    `If you haven't had the pleasure, check out the Eclipse source code and see how many levels of abstraction any given class is.
    Pretty sure I found one that was over 30 classes deep at one point.`,

    {type: 'title', title: 'Exceptions', level: 3, anchored: true, classes: ['underlined']},
    `Exceptions should only be available if you specify a flag to your compiler/interpreter, so it can be used in debugging.
    No production build should ever have exceptions if it can help it.`, {type: 'break'},
    `If you do have exceptions in production, at least make it so you have to handle them in your code. An exception should never bubble up past your main function.`,
  ],
},
//////////////////////////
// My Wandersong Ending //
//////////////////////////
{
  'title': 'My Wandersong ending',
  'content': [
    {type: 'link', title: `Wandersong`, link: 'https://en.wikipedia.org/wiki/Wandersong'}, ` is a fantastic story/character-driven puzzle platformer about a bard who, even though he is not the chosen one, still tasks himself with stopping the end of the world through the magical power of song and (optionally) dance.
    It's genuinely one of my favorite indie games, if not games in general. If you haven't checked it out yet do so now, since this will obviously contain spoilers.`, {type: 'break'},
    `I should mention that by doing this I am by no means saying the Wandersong ending is bad. However, have you ever had that feeling of annoyance when you find something
    that's so close to your interpretation of perfect, only to have it diverge just a bit and it annoys you more than anything, just because of how close it came?
    That's what the original ending is to me, and to let off some of the steam I wrote this.`,
    {type: 'title', title: 'Here there be spoilers', classes: ['italic']},
    `All throughout the game, the bard (who will hereby be referred to as Piet, since that's what I named him) is told that he is `, {content: 'not', classes: ['bold']},
    ` the chosen one.`, {type: 'break'},
    `Despite this, the ending of the game is a last-minute-hero-saves-the-day-and-is-the-chosen-one-in-everything-but-name ending.
    This disappointed me, since a big part of the charm of the story (for me) is tied to the fact that he isn't the chosen one, but he's doing his best anyway.`, {type: 'break'},
    {type: 'break'},
    `The game basically ends when the Dream King dies. The world starts to collapse in on itself and Piet, having failed in his task of getting the Earthsong together,
    gives it his all with what he's got, and ends up with what is referred to as the `, {type: 'link', title: `Wandersong`, link: 'https://www.youtube.com/watch?v=7u0wg3t6osM'} ,
    `. All the people he had met around the world join him in chanting the song.`, {type: 'break'},
    {type: 'break'},
    `Now, at this point is where I would diverge. In the real game Eyala informs you that the goddess Eya heard this and decided to not scrap the world after all,
    and then everyone lived happily ever after. I feel this goes against the idea of Piet not being the chosen one, so I propose this instead:`, {type: 'break'},
    `Eya does indeed hear you and everyone else singing, but the collapse is too far gone. You get a scene where Eyala talks to Eya,
    and she says that she was moved by the fact that everyone in the world wanted it to continue being. She says that she will implement another failsafe in the next
    iteration of the world, where if everyone unites and wishes for the world to not end, it won't.`, {type: 'break'},
    `The credits start rolling, and we see short clips/stills of another bard (the only real difference being that this one has baby blue clothing)
    going around doing the same quest you as the player just did, the implication of course being that this is the Piet of the next world iteration.
    The credits end as Piet 2.0 sings the Wandersong, but this time the world is saved.`, {type: 'break'},
    {type: 'break'},
    `That's it. Personally, I feel this ending is more inline with what the rest of the story was trying to convey. But, again, this is of course just my take on it.
    The real ending is what the devs intended, after all.`,
  ],
}];