
const game = {
  active: '~~ACTIVE~~',
  unflipTime: 1500,
  activeSelect: '',

  elements: {
    cards: null,
    gameArea: null,
    complete: null,
    score: null,
    position: null,

    colors: [
      { back: 'lightgreen', fore: 'blue' },
      { back: 'gold', fore: 'maroon' },
      { back: 'khaki', fore: 'tomato' },
      { back: 'lavender', fore: 'indigo' },
      { back: 'paleturquoise', fore: 'darkslateblue' },
      { back: 'bisque', fore: 'green' },
      { back: 'antiquewhite', fore: 'darkviolet' }
    ]
  },

  init: () => {
    game.deck.cards = [];
    game.deck.patterns = [];

    game.elements.gameArea = document.getElementById('game-area');
    game.elements.complete = document.getElementById('complete-wrapper');
    game.elements.score = document.getElementById('score');
    game.elements.position = document.getElementById('position');

    game.elements.gameArea.innerHTML = '';
    game.clicks.total = 0;
    game.clicks.count = 0;
    game.clicks.removeClicks();
    
    const active = storage.getItem(game.active);
    game.activeSelect = active;
    game.deck.triggers[active]();

    game.deck.generate();
    game.deck.shuffle();
    game.deck.display();
  },

  check: {
    isComplete: false,
    match: () => {
      const allFlipped = document.getElementsByClassName('card is-flipped');
      const active = Array.prototype.filter.call(allFlipped, (element) => {
        const classes = element.classList.value.split(' ');
        return !classes.includes('FOUND');
      });

      const firstKey = active[0].getAttribute('data-key');
      const secondKey = active[1].getAttribute('data-key');

      if (firstKey === secondKey) {
        setTimeout(() => {
          game.clicks.count = 0;
          active[0].classList.add('FOUND');
          active[1].classList.add('FOUND');
        });
        game.check.complete(allFlipped);
      } else {
        setTimeout(() => {
          game.clicks.count = 0;
          active[0].classList.remove('is-flipped');
          active[1].classList.remove('is-flipped');  
        }, game.unflipTime);
      }
    },
    complete: (allFlipped) => {
      game.check.isComplete = (allFlipped.length === game.deck.cards.length);
      if (game.check.isComplete) {
        game.elements.score.innerText = game.clicks.total;
        const position = game.check.highScore(game.clicks.total);
        if (position <= 10) {
          game.elements.position.innerText = `${ game.check.wording[position] } Place!`;
        } else {
          game.elements.position.innerText = `Not a Top Ten Score.`;
        }
        setTimeout(() => {
          game.elements.complete.classList.remove('hidden');
        }, game.unflipTime);
      }
    },
    wording: {
      '1': 'First',
      '2': 'Second',
      '3': 'Third',
      '4': 'Fourth',
      '5': 'Fifth',
      '6': 'Sixth',
      '7': 'Seventh',
      '8': 'Eighth',
      '9': 'Ninth',
      '10': 'Tenth',
    },
    highScore: (score) => {
      let scores = storage.getItem(game.activeSelect) || [];
      let insertAt = -1;
      for (let i = 0, len = scores.length; i < len; i++) {
        console.log({ here: scores[i], score });
        if (scores[i] > score) {
          insertAt = i;
          break;
        }
      }
      if (insertAt === -1) {
        insertAt = scores.length;
        scores.push(score);
      } else {
        scores.splice(insertAt, 0, score);
      }
      const finalScores = scores.slice(0, 10);
      storage.setItem(game.activeSelect, finalScores);
      return (insertAt + 1);
    },

    restart: () => {
      game.elements.complete.classList.add('hidden');
      game.init();
    },
    back: () => {
      window.location.href = '/';
    }
  },

  deck: {
    cards: [],
    patterns: [],
    maxCards: 16,

    descriptions: [
      { title: '4 Card', debug: true, trigger: 'trigger2by1' },
      { title: '16 Card', debug: false, trigger: 'trigger4by2' },
      { title: '30 Card', debug: false, trigger: 'trigger5by3' },
      { title: '40 Card', debug: false, trigger: 'trigger5by4' }
    ],
    triggers: {
      trigger2by1: () => { game.deck.configure2by1(); },
      trigger4by2: () => { game.deck.configure4by2(); },
      trigger5by3: () => { game.deck.configure5by3(); },
      trigger5by4: () => { game.deck.configure5by4(); }
    },

    perRow: 5,
    multiplyRow: 3,
    
    configure: (perRow = 5, multiplyRow = 3) => {
      game.deck.perRow = perRow;
      game.deck.multiplyRow = multiplyRow;
    },

    configure2by1: () => {
      game.deck.configure(2, 1);
    },
    configure4by2: () => {
      game.deck.configure(4, 2);
    },
    configure5by3: () => {
      game.deck.configure(5, 3);
    },
    configure5by4: () => {
      game.deck.configure(5, 4);
    },

    totalCards: () => {
      return game.deck.perRow * game.deck.multiplyRow;
    },
    generate: () => {
      game.deck.cards = [];
      game.deck.patterns = [];

      for (let i = 0, len = game.deck.totalCards(); i < len; i++) {
        const { color, asset } = game.deck.getPattern();

        const colors = game.elements.colors[color];
        game.deck.cards.push({ colors, asset, key: i }, { colors, asset, key: i });
        game.deck.patterns.push(`${ asset }-${ color }`);
      }
    },
    getPattern: () => {
      const color = Math.floor(Math.random() * 7);
      const asset = Math.floor(Math.random() * game.deck.maxCards) + 1;
      const pattern = `${ asset }-${ color }`;

      if (game.deck.patterns.includes(pattern)) {
        return game.deck.getPattern();
      } else {
        return { color, asset };
      }
    },
    display: () => {
      const cards = game.deck.cards;
      let rowCount = 1;
      let rowHTML;
      for (let i = 0, len = cards.length; i < len; i++) {
        if (rowCount === 1) {
          rowHTML = document.createElement('div');
          rowHTML.setAttribute('class', 'row');
        }
        
        const card = game.card.generate(cards[i]);
        rowHTML.appendChild(card);

        if (rowCount === game.deck.perRow) {
          rowCount = 1;
          game.elements.gameArea.appendChild(rowHTML);
        } else {
          rowCount = rowCount + 1;
        }
      }
      game.clicks.captureClicks();  
    },
    shuffle: () => {
      const deck = game.deck.cards;
      let position = deck.length;

      while (position) {
        let to = Math.floor(Math.random() * position--);
    
        [deck[position], deck[to]] = [deck[to], deck[position]];
      }      
    }
  },

  clicks: {
    count: 0,
    total: 0,
    handleClicks: (event) => {
      if (game.clicks.count === 2) {
        return;
      }
      const card = game.getParent(event.target);
      const classes = card.classList.value.split(' ');
      if (classes.includes('FOUND')) {
        return;
      }

      card.classList.toggle('is-flipped');
      game.clicks.count = game.clicks.count + ((card.classList.value === 'card') ? -1 : 1);
      game.clicks.total = game.clicks.total + 1;
      if (game.clicks.count === 2) {
        game.check.match();
      }
    },
    captureClicks: () => {
      game.elements.cards = document.getElementsByClassName('card');
      for (let i = 0, len = game.elements.cards.length; i < len; i++) {
        game.elements.cards[i].addEventListener('click', game.clicks.handleClicks);
      }
    },
    removeClicks: () => {
      if (game.elements.cards === null) {
        return;
      }
      for (let i = 0, len = game.elements.cards.length; i < len; i++) {
        game.elements.cards[i].removeEventListener('click', game.clicks.handleClicks);
      }
    }
  },

  getParent: (element) => {
    const list = element.classList.value.split(' ');
    if (list.includes('card')) {
      return element;
    }

    return game.getParent(element.parentNode);
  },

  card: {
    generate: (card) => {
      let html = `
        <div class="scene">
          <div data-key="~~KEY~~" class="card"~~STYLE~~>
            <span class="card-face card-face--front">
              <svg class="icon-small">
                <use xlink:href="#cards"></use>
              </svg>
            </span>
            <span class="card-face card-face--back">
              <svg class="icon">
                <use xlink:href="#Asset ~~NUMBER~~"></use>
              </svg>
            </span>
          </div>
        </div>
      `;
      html = html.replace(/~~NUMBER~~/g, card.asset);
      html = html.replace(/~~KEY~~/g, card.key);

      let style = ' ';
      style += `--card-background-color: ${ card.colors.back };`;
      style += `--card-border-color: ${ card.colors.fore };`;
      html = html.replace(/~~STYLE~~/g, (style.trim().length === 0) ? `` : ` style="${ style }"`);

      const content = game.htmlToElement(html);
      return content;
    }
  },

  htmlToElement: (html) => {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }
};