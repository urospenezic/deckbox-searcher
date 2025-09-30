/*
BYPASS CORS:
For Windows:

Open the start menu

Type windows+R or open "Run"

Execute the following command:

 chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security

*/

class App {
  static init() {
    this.mainController = new Controller();
  }
}

class Controller {
  constructor() {
    this.render();
  }

  onAddInfoClicked() {
    this.toggleSection(this.form, true);
    this.toggleSection(this.backdrop, true);
    this.toggleSection(this.cardListSection, false);
    this.toggleSection(this.errorSection, false);
    this.toggleSection(this.entryText, false);

    const goBtn = this.form.querySelector('#go-btn');
    if (!goBtn.hasAttribute('attachedListener')) {
      goBtn.addEventListener('click', this.onStart.bind(this));
    }

    goBtn.setAttribute('attachedListener', 'true');
  }

  onStart() {
    this.toggleLoading();

    const info = this.gatherFormInfo();
    const myMap = new CaseInsensitiveMap();
    info.list.forEach((s) => myMap.set(s, 0));

    this.myCards = new CardMap(myMap);
    this.fetcher = new CardListFetcher(
      info.url,
      this.onRemoteCardsLoaded.bind(this),
      this.onError.bind(this)
    );
    this.fetcher.start();
  }

  onRemoteCardsLoaded(map) {
    this.remoteCardMap = new CardMap(map);
    this.matchingCardMap = this.myCards.getMatchingCards(this.remoteCardMap);

    if (this.remoteCardMap.size > 0) {
      console.log('empty response');
      return;
    }

    this.toggleLoaded();
  }

  onError(err) {
    console.log(err);
    this.toggleError();
  }

  toggleSection(section, isVisible) {
    if (isVisible) {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }
    this.toggleBackdrop((section === this.form && isVisible));
  }

  toggleLoading() {
    this.toggleSection(this.loadingSection, true);
    this.toggleSection(this.entryText, false);
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.form, false);
    this.toggleSection(this.cardListSection, false);
    this.toggleSection(this.remoteListSection, false);
  }

  toggleLoaded() {
    this.matchingCardMap.render(this.cardListSection);
    //this.myCards.render(this.myCardsSection);
    this.remoteCardMap.render(this.remoteListSection);

    this.toggleSection(this.cardListSection, true);
    //this.toggleSection(this.myCardsSection, true);
    this.toggleSection(this.remoteListSection, true);
    this.toggleSection(this.errorSection, false);
    this.toggleSection(this.loadingSection, false);
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.form, false);
  }

  toggleError() {
    this.toggleSection(this.entryText, false);
    this.toggleSection(this.cardListSection, false);
    this.toggleSection(this.remoteListSection, false);
    this.toggleSection(this.errorSection, true);
    this.toggleSection(this.form, false);
    this.toggleSection(this.loadingSection, false);
  }

  toggleBackdrop(on) {
    if (on) {
      this.backdrop.classList.add('visible');
    } else {
      this.backdrop.classList.remove('visible');
    }
  }

  gatherFormInfo() {
    const setUrl = this.form.querySelector('#set').value;
    const myCardList = this.form
      .querySelector('#my-card-list')
      .value.split('\n')
      .filter((item) => item.trim() !== '');

    return {
      url: setUrl,
      list: myCardList,
    };
  }

  onBackdropClicked() {
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.form, false);
  }
  render() {
    this.cardListSection = document.getElementById('cards-found');
    this.errorSection = document.getElementById('error');
    this.backdrop = document.getElementById('backdrop');
    this.addBtn = document.getElementById('add-btn');
    this.form = document.getElementById('add-modal');
    this.entryText = document.getElementById('entry-text');
    this.loadingSection = document.getElementById('loading-animation');
    //this.myCardsSection = document.getElementById('my-cards');
    this.remoteListSection = document.getElementById('users-cards');

    this.entryText.classList.add('visible');

    this.addBtn.addEventListener('click', this.onAddInfoClicked.bind(this));
    this.backdrop.addEventListener('click', this.onBackdropClicked.bind(this));
  }
}

class CardModel {
  constructor(title = 'ERROR', quantity = 0) {
    this.title = title;
    this.quantity = quantity;
  }

  toString() {
    return `${title} : ${this.quantity}`;
  }
  equals(otherCard) {
    return otherCard.title === this.title;
  }

  render(list) {
    const item = document.createElement('li');
    item.classList.add('card-element');

    item.innerHTML = `
        <div class="card-element__info">
            <h2>${this.title}</h2>
            <p>Available: ${this.quantity}</p>
        </div>
    `;

    list.append(item);
  }
}

class CardMap {
  constructor(cards) {
    this.entries = cards;
    const cardList = [];
    cards.forEach((key, value) => cardList.push(new CardModel(value, key)));
    this.cards = cardList;
  }

  getMatchingCards(otherCards) {
    const other = otherCards.entries;
    if (other.size === 0) {
      return [];
    }
    const matching = new CaseInsensitiveMap();
    for (const [key, value] of this.entries.entries()) {
      if (other.has(key)) {
        matching.set(key, other.get(key));
      }
    }

    return new CardMap(matching);
  }

  render(parent) {
    const list = parent.querySelector('ul');
    list.innerHTML = ``;
    for (const card of this.cards) {
      card.render(list);
    }

    const copyBtn = parent.querySelector('button');
    copyBtn.addEventListener('click', () => {
      var values = this.entries.keys();
      navigator.clipboard.writeText([...values].toString());
    });
  }
}

class CardListFetcher {
  constructor(setUrl, successCallback, errorCallback) {
    this.urlToHit = setUrl;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.regex = /^(\d+)\s(.+)/;
  }

  async start() {
    try {
      const result = await this.fetch(this.urlToHit);
      const map = this.parseResponse(result);
      this.successCallback(map);
    } catch (err) {
      console.error(err);
      this.errorCallback(err);
    }
  }

  parseResponse(response) {
    console.log('Parsing response:', response);
    if (!response || response.trim() === '') {
      return new CaseInsensitiveMap();
    }

    try {
      // Parse JSON response from Puppeteer scraper
      const data = JSON.parse(response);
      const map = new CaseInsensitiveMap();
      
      if (data.cards && Array.isArray(data.cards)) {
        data.cards.forEach(card => {
          if (card.name && card.quantity) {
            const name = card.name.trim();
            const quantity = parseInt(card.quantity) || 0;
            
            if (map.has(name)) {
              map.set(name, map.get(name) + quantity);
            } else {
              map.set(name, quantity);
            }
          }
        });
      }
      
      console.log(`Parsed ${map.size} unique cards`);
      return map;
    } catch (error) {
      console.error('Failed to parse response:', error);
      this.errorCallback(error);
      return new CaseInsensitiveMap();
    }
  }



  async fetch(url) {
    try {
      const testProxyUrl = `http://localhost:3000/proxy/?url=${encodeURIComponent(url)}`;
      const proxyUrl = `https://deckbox-searcher.onrender.com/proxy/?url=${encodeURIComponent(url)}`;
      
      // Use local proxy for development, production proxy for deployed version
      const targetUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? testProxyUrl 
        : proxyUrl;
      
      console.log(`Making request to: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/html',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        console.log('SUCCESS - Response received');
        const text = await response.text();
        console.log(`Response length: ${text.length} characters`);
        return text;
      } else {
        throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('An error occurred whilst fetching data:', error);
      throw error;
    }
  }
}

class RequestStatus {
  constructor(code, message = '', response = null) {
    this.code = code;
    this.errorMessage = message;
    this.response = response;
  }
}

class CaseInsensitiveMap extends Map {
  constructor() {
    super();
    this.original = new Map();
  }

  set(key, value) {
    if (typeof key === 'string') {
      const normalized = this._normalizeKey(key);
      this.original.set(key, value);
      return super.set(normalized, value);
    }

    return super.set(key, value);
  }

  get(key) {
    let normalizedKey;
    if (typeof key === 'string') {
      normalizedKey = this._normalizeKey(key);
    }
    return super.get(normalizedKey);
  }

  keys(){
    return this.original.keys();
  }

  has(key) {
    return super.has(this._normalizeKey(key));
  }

  entries() {
    if (this.original.size > 0) {
      return this.original.entries();
    }
    return super.entries();
  }

  _normalizeKey(key) {
    return key.toLowerCase();
  }
}

App.init();
