# Deckbox Searcher

A simple vanilla JavaScript tool for searching multiple Magic: The Gathering cards at once from any user's Deckbox inventory.

## Overview

Deckbox Searcher is a web application that helps you efficiently search for multiple cards in a user's [Deckbox.org](https://deckbox.org/) inventory. Instead of manually searching for cards one at a time, this tool allows you to paste a list of cards you're looking for and quickly find which ones a specific user has in their collection.

## Features

- **Batch Card Search**: Search for multiple cards at once by providing a list
- **Real-time Results**: Displays which cards from your list are available in the user's inventory
- **Privacy Focused**: No data is cached or stored anywhere - all searches are ephemeral
- **Simple Interface**: Clean, intuitive UI that's easy to use
- **Proxy Server**: Built-in proxy to handle CORS and authentication with Deckbox.org

## How It Works

The application consists of two main components:

1. **Frontend**: A vanilla JavaScript single-page application that provides the user interface
2. **Backend**: An Express.js proxy server that forwards requests to Deckbox.org while handling authentication

The frontend sends your card list and the target user's Deckbox URL to the proxy server, which then fetches and parses the DOM from Deckbox.org to find matching cards.

## Installation

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/urospenezic/deckbox-searcher.git
cd deckbox-searcher
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Click the **"ADD INFO"** button to open the search form
2. Enter your Deckbox credentials (username and password)
   - Note: Your credentials are only used to authenticate the proxy request and are not stored
3. Paste the target user's Deckbox set URL (e.g., `https://deckbox.org/sets/123456`)
4. Enter your card list in the text area, with one card name per line
5. Click **"START SEARCH"** to begin
6. Review the results showing which cards the user has from your list
7. Use the **"COPY"** button to copy the results to your clipboard

### Important Notes

- Make sure you're logged into your Deckbox account in your browser before using this tool
- The tool cannot handle email confirmation redirects
- All data is processed in real-time and nothing is saved or cached

## Project Structure

```
deckbox-searcher/
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── public/
│   │   └── assets/
│   │       ├── scripts/
│   │       │   └── index.js # Frontend JavaScript
│   │       └── styles/
│   │           └── index.css # Styling
│   └── README.md            # Frontend-specific readme
├── server/
│   └── server.js            # Express proxy server
├── package.json             # Project dependencies
└── README.md                # This file
```

## Technical Details

### Frontend
- Pure vanilla JavaScript (no frameworks)
- ES6+ features including classes and async/await
- DOM manipulation for dynamic UI updates
- Fetch API for server communication

### Backend
- Express.js web server
- HTTP/HTTPS proxy functionality
- Static file serving
- CORS handling

## Disclaimer and Copyright

This tool is an independent project and is **not affiliated with, endorsed by, or sponsored by Deckbox.org or its operators**.

- **Deckbox.org**: All content, trademarks, and data from Deckbox.org are property of their respective owners
- **Magic: The Gathering**: Magic: The Gathering and all related content are owned by Wizards of the Coast LLC
- This tool is intended for personal use only to facilitate card trading and collection management
- Users are responsible for complying with Deckbox.org's Terms of Service and API usage policies
- Do not use this tool in a way that could overload or abuse Deckbox.org's servers

## License

ISC License

Copyright (c) pepegica

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Contributing

This is a personal project, but suggestions and improvements are welcome. Feel free to open an issue or submit a pull request.

## Author

- **pepegica** (Uros Penezic)

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
