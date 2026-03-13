# Pulse — php_social

A full-stack PHP social platform demo built on top of [ano](https://github.com/reshuk-code/ano) — personalized feed ranking as an API.

## What this is

Pulse is a real social app (not a demo with dummy data) that shows how to integrate ano into a PHP project. Users sign up, write posts, comment, like, follow each other — and the feed is ranked by ano based on each user's actual behaviour.

## Features

- Real signup / login with hashed passwords
- Write posts, comments, likes, follows
- ANO-powered personalized feed — ranks real posts per user
- Topic onboarding on first login
- "Why am I seeing this?" breakdown per post
- Interests page to manage explicit topic preferences
- User profiles with bio, follower/following counts
- CSRF protection on all forms and AJAX calls
- SQLite database — zero setup, no external DB needed

## Stack

- PHP 8+ (built-in server for local dev)
- SQLite via PDO
- [ano API](https://ano-ochre.vercel.app) for feed ranking
- Vanilla JS for AJAX interactions
- Zero frameworks, zero dependencies

## Setup

### 1. Clone

```bash
git clone https://github.com/reshuk-code/ano
cd ano-app/php_social
```

### 2. Configure

```bash
cp config.example.php config.php
# Open config.php and add your ANO API key
# Get a free key at https://ano-ochre.vercel.app/dashboard
```

### 3. Enable PHP OpenSSL (required for ANO API calls)

Make sure `extension=openssl` is enabled in your `php.ini`.

### 4. Run

```bash
php -S localhost:8000
```

Open `http://localhost:8000` — create an account and start posting.

The SQLite database (`data/pulse.db`) is created automatically on first run.

## Project structure

```
php_social/
├── index.php          # Login / signup
├── onboard.php        # Topic picker (first login)
├── feed.php           # Main personalized feed
├── post.php           # Single post + comments
├── user.php           # User profile + follow
├── create.php         # Write a post
├── interests.php      # Manage topic preferences
├── delete_post.php    # Delete handler
├── logout.php
├── includes/
│   ├── db.php         # SQLite layer (users, posts, likes, follows, comments)
│   ├── ano.php        # ANO API client (raw socket, no cURL needed)
│   ├── header.php     # Shared topbar
│   └── footer.php
├── ajax/
│   ├── like.php       # Toggle like via AJAX
│   └── event.php      # Send ANO engagement event
├── assets/
│   ├── style.css
│   └── app.js
├── data/              # SQLite DB lives here (git-ignored)
└── config.php         # Your API key goes here (git-ignored)
```

## Powered by ano

Feed ranking is handled entirely by [ano](https://github.com/reshuk-code/ano). Every post written on Pulse is sent to ano's `/feed` endpoint and returned ranked specifically for the viewing user. Engagement events (like, skip, hide, view) are fired back to ano's `/event` endpoint so the ranking improves over time.
