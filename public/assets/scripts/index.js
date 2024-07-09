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
    this.toggleSection(this.entryText, true);

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
      info.username,
      info.password,
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

    this.matchingCardMap.render(this.cardListSection);
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
    this.toggleBackdrop(section !== this.form);
  }

  toggleLoading() {
    this.toggleSection(this.loadingSection, true);
    this.toggleSection(this.entryText, false);
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.form, false);
  }

  toggleLoaded() {
    this.toggleSection(this.cardListSection, true);
    this.toggleSection(this.errorSection, false);
    this.toggleSection(this.loadingSection, false);
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.form, false);
  }

  toggleError() {
    this.toggleSection(this.backdrop, false);
    this.toggleSection(this.entryText, false);
    this.toggleSection(this.form, false);
    this.toggleSection(this.cardListSection, false);
    this.toggleSection(this.errorSection, true);
  }

  toggleBackdrop(on) {
    if (on) {
      this.backdrop.classList.add('visible');
    } else {
      this.backdrop.classList.remove('visible');
    }
  }

  gatherFormInfo() {
    const username = this.form.querySelector('#username').value;
    const password = this.form.querySelector('#password').value;
    const setUrl = this.form.querySelector('#set').value;
    const myCardList = this.form
      .querySelector('#my-card-list')
      .value.split('\n');

    return {
      username: username,
      password: password,
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
  }
}

class CardListFetcher {
  constructor(setUrl, username, pass, successCallback, errorCallback) {
    this.username = username;
    this.password = pass;
    this.urlToHit = setUrl;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.regex = /^(\d+)\s(.+)/;
  }

  async start() {
    try {
      const result = await this.fetch(this.fullUrl);
      const map = this.parseResponse(result);
      this.successCallback(map);
    } catch (err) {
      console.error(err);
      this.errorCallback(err);
    }
    // this.fetch(this.fullUrl)
    //   .then((result) => {
    //     if (result) {
    //       const map = this.parseResponse(result);
    //       this.successCallback(map);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     this.errorCallback(err);
    //   });
  }

  parseResponse(response) {
    console.log(response);
    if (response.trim() === '') {
      return new CaseInsensitiveMap();
    }

    try {
      const dom = new DOMParser().parseFromString(response, 'text/html');
      //GET BASE NODES
      const nodesBase = dom.body.childNodes;
      //FILTER THE NODE BS OUT AND GET THE TEXT ONLY, DON'T LET DUPLICATES
      const map = new CaseInsensitiveMap();
      [...nodesBase]
        .filter((c) => c.textContent.trim() !== '')
        .forEach((txtNode) => {
          const txt = txtNode.textContent.trim();
          const match = txt.match(this.regex);

          if (match) {
            const quantity = match[1];
            const name = match[2];
            if (map.has(name)) {
              map.set(name, parseInt(map.get(name)) + 1);
            } else {
              map.set(name, quantity);
            }
          } else {
            console.log(
              'MATCH REGEX FAILED. CONTACT MEH SO I CAN CHECK WTF IS GOING ON'
            );
          }
        });
      return map;
    } catch (error) {
      console.error(error);
      this.errorCallback(error);
      return new CaseInsensitiveMap();
    }
  }

  get fullUrl() {
    let searchTerm = 'export?s=&f=&o='; //default Deckbox export to text sorted search
    if (!this.urlToHit.endsWith('/')) {
      searchTerm = `/${searchTerm}`;
    }
    return this.urlToHit + searchTerm;
  }

  async fetch(url) {
    try {
      const corsAnywhereUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(this.username + ':' + this.password)}`,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/html',
        },
        redirect: 'error', // Prevent automatic following of redirects
      });

      if (response.ok) {
        console.log('SUCCESS');
        return await response.text();
      } else {
        throw new Error(`HTTP status ${response.status}`);
      }
    } catch (error) {
      console.error('An error occurred whilst fetching data:', error);
      throw error;
    }

    // return new Promise((resolve, reject) => {
    //   const request = new XMLHttpRequest();
    //   request.addEventListener('load', () => {
    //     if (request.status >= 200 && request.status < 300) {
    //       console.log('SUCCESS');
    //       resolve(request.responseText);
    //     }else {
    //       reject(new Error(`HTTP status ${request.status}`));
    //     }
    //   });

    //   request.addEventListener('error', () => {
    //     reject(new Error('An error occurred whilst fetching data'));
    //   });
    //   try {
    //     request.open('GET', url);
    //     request.setRequestHeader(
    //       'authorization',
    //       `Basic ${btoa(this.username + ':' + this.password)}`
    //     );
    //     request.redirect = 'error';
    //     console.log('sending request..');
    //     request.send();
    //   } catch (err) {
    //     reject(err);
    //   }
    // });
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
