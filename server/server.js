const express = require('express');
const path = require('path');
const https = require('https');
const { JSDOM } = require('jsdom');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.static(path.join(__dirname, '..', '/frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use('/proxy', async (req, res) => {
  const url = req.query.url;
  console.log(`Scraping request for: ${url}`);
  
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const setMatch = url.match(/\/sets\/(\d+)/);
    if (!setMatch) {
      return res.status(400).send('Invalid Deckbox set URL');
    }
    const setId = setMatch[1];
    
    console.log(`Scraping public set ${setId}`);
    const cardData = await scrapeDeckboxSet(setId);
    
    if (cardData.error) {
      return res.status(500).send(cardData.error);
    }
    
    console.log(`Successfully scraped ${cardData.cards.length} cards`);
    
    res.status(200);
    res.setHeader('content-type', 'application/json');
    res.json(cardData);
    
  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).send(`Scraping failed: ${err.message}`);
  }
});

async function scrapeDeckboxSet(setId) {
  try {
    const allCards = [];
    let pageNum = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const setUrl = `https://deckbox.org/sets/${setId}?p=${pageNum}`;
      console.log(`Scraping page ${pageNum}: ${setUrl}`);
      
      try {
        const html = await fetchPage(setUrl);
        const pageCards = parseCardsFromHtml(html);
        
        console.log(`Page ${pageNum}: Found ${pageCards.length} cards`);
        
        if (pageCards.length === 0) {
          hasMorePages = false;
          console.log(`Stopping pagination: No cards found on page ${pageNum}`);
        } else {
          allCards.push(...pageCards);
        }
        
      } catch (err) {
        console.log(`Failed to load page ${pageNum}: ${err.message}`);
        if (pageNum === 1) {
          return { error: `Failed to load first page: ${err.message}` };
        }
        break;
      }
      
      pageNum++;
      
      if (pageNum > 100) {
        console.log('Stopping at page 100 for safety');
        break;
      }
    }
    
    console.log(`Total cards scraped: ${allCards.length}`);
    return { cards: allCards };
    
  } catch (error) {
    console.error('Scraping error:', error);
    return { error: `Scraping failed: ${error.message}` };
  }
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function parseCardsFromHtml(html) {
  const cards = [];
  
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const table = document.getElementById('set_cards_table_details');
    if (!table) {
      console.log('Table #set_cards_table_details not found');
      return cards;
    }
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach((row, index) => {
      try {
        if (row.querySelector('th')) return;
        
        const quantityCell = row.querySelector('td.inventory_count.card_count') || 
                           row.querySelector('td.tradelist_count.card_count') ||
                           row.querySelector('td:first-child');
        
        const nameCell = row.querySelector('td:nth-child(2) a.simple');
        
        if (quantityCell && nameCell) {
          const quantity = quantityCell.textContent.trim();
          const name = nameCell.textContent.trim();
          
          if (quantity && name && /^\d+$/.test(quantity)) {
            cards.push({
              quantity: parseInt(quantity),
              name: name
            });
          }
        }
      } catch (e) {
        console.log(`Error parsing row ${index + 1}:`, e);
      }
    });
    
  } catch (e) {
    console.log('Error parsing HTML:', e);
  }
  
  return cards;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Deckbox scraper server listening on port ${PORT}`);
});