# Contributing to ano

Thanks for your interest in contributing. ano is a small open-source project and every contribution genuinely matters.

## Ways to contribute

### 1. Expand the topic taxonomy
The biggest immediate improvement to ano's accuracy is a richer topic taxonomy. The current 12 topics (`Scripts/sys.js`) are broad — contributions that add sub-topics, more keyword signals, or entirely new topic categories are very welcome.

### 2. Add SDK wrappers
ano currently has no official client libraries. If you write PHP, Python, Go, Ruby, or anything else — a thin SDK wrapper around the REST API would make it dramatically easier for developers in those ecosystems to integrate.

### 3. Bug reports and issues
Open a GitHub issue. Include the request/response that triggered the bug if relevant.

### 4. Improve the NLP parser
The topic extraction in `Scripts/sys.js` uses keyword matching. There's a lot of room to improve accuracy — better stemming, negation handling, multi-word phrase detection.

## Getting started

```bash
git clone https://github.com/reshuk-code/ano
cd ano
npm install
cp .env.example .env
# Fill in Firebase credentials
npm run dev
```

## Project structure

```
lib/
  feedScorer.js    — scoring and ranking logic
  postParser.js    — wraps NLP with post metadata handling
  userProfile.js   — user interest model (explicit + implicit signals)
  apiKeys.js       — API key management
  storage.js       — Firestore read/write
  tenants.js       — tenant management
Scripts/
  sys.js           — NLP topic extraction engine
  avoid_word.txt   — noise word list
server.js          — HTTP server and routes
```

## Pull request guidelines

- Keep PRs focused — one thing per PR
- Add a clear description of what you changed and why
- If you're changing scoring logic, include before/after examples

## Questions?

Open a GitHub Discussion or reach out via the issues tab.
