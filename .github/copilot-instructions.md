# Deckbox Searcher - Copilot Instructions

## Project Overview
Deckbox Searcher is a web-based tool for searching multiple cards at once from Deckbox user inventories. It helps users avoid searching through Deckbox inventories one card at a time by providing batch search functionality.

## Technology Stack
- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript (ES6+ classes), HTML5, CSS3
- **Server**: Express proxy server to handle CORS issues when accessing Deckbox

## Project Structure

```
/
├── frontend/              # Frontend application
│   ├── index.html        # Main HTML page
│   ├── README.md         # Frontend documentation
│   └── public/
│       └── assets/
│           ├── scripts/
│           │   └── index.js   # Main JavaScript application
│           └── styles/
│               └── index.css  # Application styles
├── server/               # Backend server
│   └── server.js         # Express proxy server
└── package.json          # Node.js dependencies and scripts
```

## Architecture

### Frontend (Vanilla JavaScript)
The frontend uses a class-based architecture with the following components:

1. **App**: Main application initializer
2. **Controller**: Manages UI state and user interactions
3. **CardModel**: Represents individual card data (title, quantity)
4. **CardMap**: Collection of cards with matching functionality
5. **CardListFetcher**: Handles fetching card data from Deckbox via proxy
6. **RequestStatus**: Represents HTTP request status
7. **CaseInsensitiveMap**: Custom Map implementation for case-insensitive card name matching

### Backend (Express Server)
- Serves static frontend files
- Provides a `/proxy` endpoint to bypass CORS restrictions when accessing Deckbox
- Handles authentication headers (username/password) to access protected Deckbox inventories

## Key Features
1. User authentication with Deckbox credentials
2. Batch search for multiple cards from a text list
3. Case-insensitive card name matching
4. Display of matching cards with quantities
5. Copy-to-clipboard functionality for results

## Development Guidelines

### Code Style
- Use ES6+ features (classes, arrow functions, const/let, template literals)
- Use camelCase for variable and function names
- Use PascalCase for class names
- Maintain consistent indentation (2 spaces)
- Keep comments minimal and meaningful

### JavaScript Patterns
- Use class-based architecture for components
- Bind event handlers to maintain context (`this.method.bind(this)`)
- Use async/await for asynchronous operations
- Prefer querySelector/querySelectorAll for DOM manipulation

### HTML/CSS Conventions
- Use semantic HTML5 elements
- Use BEM-like naming for CSS classes (e.g., `card-element__info`)
- Use ID selectors for unique elements that need JavaScript interaction
- Maintain responsive design with flexbox

### API Integration
- All external requests to Deckbox must go through the `/proxy` endpoint
- Include authentication headers for protected resources
- Handle errors gracefully with user-friendly messages

## Building and Running

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm start
```
The server runs on port 3000 by default (configurable via PORT environment variable).

### Build
No build step is required - the application uses vanilla JavaScript served directly.

## Testing
Currently, there are no automated tests. Manual testing should cover:
- Form submission with valid Deckbox credentials
- Card list parsing and matching
- Error handling for network failures
- Copy-to-clipboard functionality

## Important Implementation Notes

### CORS Handling
The application uses a proxy server to bypass CORS restrictions. Direct requests to Deckbox from the frontend are not possible due to CORS policies.

### Authentication
- Credentials are passed through the proxy server to Deckbox
- Credentials are NOT saved or cached anywhere
- Users must be logged into Deckbox in their browser for the best experience

### Card Matching
- Card names are matched case-insensitively using the `CaseInsensitiveMap` class
- Input card list is parsed by splitting on newline characters
- Matching results show the quantity available in the remote inventory

## Common Tasks

### Adding a New Feature
1. Determine if changes are needed in frontend (UI/logic) or backend (proxy)
2. For frontend: Add methods to appropriate classes, update UI in index.html/css
3. For backend: Add new routes or modify proxy behavior
4. Test manually by running the server and interacting with the UI

### Modifying UI
1. Update HTML structure in `frontend/index.html`
2. Update styles in `frontend/public/assets/styles/index.css`
3. Update JavaScript interactions in `frontend/public/assets/scripts/index.js`
4. Test with `npm start` and verify in browser

### Debugging
- Use browser DevTools for frontend debugging
- Check server console logs for backend issues
- Verify network requests in browser DevTools Network tab
- Common issue: CORS errors mean requests aren't going through the proxy

## Security Considerations
- Credentials are transmitted but not stored
- The proxy server passes credentials to Deckbox over HTTPS
- No persistent storage of user data
- Be cautious with logging to avoid exposing sensitive information
