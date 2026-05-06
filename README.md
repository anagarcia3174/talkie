# Talkie

<div align="center">

<!-- Add screenshots/banner.png later -->

<!-- Recommended size: 1200×630 -->

## Track what you watch. Review what moves you.

A social movie and TV tracking app built with React Native, Expo, TypeScript, and Supabase.

[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=flat-square\&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-55-000020?style=flat-square\&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square\&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square\&logo=supabase)](https://supabase.com/)

*Currently in active development — iOS & Android*

</div>

---

## Highlights

* Built solo using React Native, Expo, TypeScript, and Supabase
* Timestamp-based commenting system for movies and TV episodes
* Fully typed Services → Stores → Components architecture
* PostgreSQL + RLS-backed backend with 18 relational tables
* Zustand-powered state management with parallel store hydration
* Cross-platform support for iOS and Android

---

## Table of Contents

* [About](#about)
* [Core Features](#core-features)
* [Screenshots](#screenshots)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Database Design](#database-design)
* [Engineering Decisions](#engineering-decisions)
* [Getting Started](#getting-started)
* [Project Status](#project-status)
* [Environment Variables](#environment-variables)
* [Author](#author)

---

## About

Talkie is a social mobile app for film and TV enthusiasts. Users can track what they watch, write rated reviews, organize custom lists, and interact with a social feed centered around movies and television.

Its flagship feature is **timestamp-anchored commenting**.

Users can leave comments tied directly to a specific moment in a movie or a specific TV episode. Instead of broad reactions, discussions become tied to exact scenes and moments.

Examples:

* A movie comment can be attached to `1:24:32`
* A TV comment can target `Season 2 • Episode 5`

The project was built as a full-stack mobile application covering authentication, social features, media metadata caching, moderation systems, state management, image storage, and a polished cross-platform UI.

---

## Core Features

### Timestamp-Anchored Commenting *(Flagship Feature)*

* Comment on movies at exact `mm:ss` timestamps
* Comment on TV episodes by season and episode number
* Spoiler tagging support
* Like, edit, and delete comments
* Report inappropriate content

### Reviews & Ratings

* Write reviews with a `0–10` rating system
* Edit and delete reviews
* Like other users’ reviews
* Spoiler support

### Media Discovery & Tracking

* Trending feed for movies and TV shows
* Full-text media search
* Rich detail pages with metadata and episode information
* Watch status tracking: `Watched`, `Watching`, `Pending`

### Lists

* Default `Library` and `Favorites` lists
* Up to 5 custom lists per user
* Public and private list visibility
* Like and discover public lists from other users

### Social Features

* Follow other users
* Block users across the app
* Public and private profile modes
* User statistics and activity tracking

### User Experience

* Full dark mode support
* Haptic feedback on interactions
* Avatar upload with image compression
* Integrated bug report and feedback flows
* Soft account deletion with restoration support

---

## Screenshots

> Screenshots and demo GIFs will be added soon.

Recommended future screenshots:

* Home feed
* Media detail screen
* Timestamp comment UI
* Search screen
* Lists screen
* User profile

---

## Tech Stack

### Frontend

| Technology              | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| React Native            | Cross-platform mobile framework          |
| Expo                    | Native tooling and development workflow  |
| TypeScript              | Static typing across the entire codebase |
| Expo Router             | File-based navigation                    |
| NativeWind v4           | Tailwind-style utility-first styling     |
| Zustand                 | Global state management                  |
| React Native Reanimated | Gesture-driven animations                |
| Lucide React Native     | Icon library                             |
| date-fns                | Date utilities                           |

### Backend

| Technology               | Purpose                               |
| ------------------------ | ------------------------------------- |
| Supabase PostgreSQL      | Relational database                   |
| Supabase Auth            | Authentication and session management |
| Supabase Edge Functions  | API layer and TMDB metadata proxy     |
| Supabase Storage         | Avatar image hosting                  |
| Row-Level Security (RLS) | Fine-grained database authorization   |

### Authentication

* Apple Sign-In (`expo-apple-authentication`)
* Email/password authentication via Supabase Auth

---

## Architecture

Talkie follows a strict layered architecture:

```txt
Services → Stores → Components
```

UI components never directly access the database.

### Project Structure

```txt
app/                    Expo Router screens
components/             Reusable UI components
services/               Supabase data access layer
store/                  Zustand state stores
context/                Authentication provider
types/                  Shared TypeScript types
utils/                  Utilities and helpers
hooks/                  Shared hooks
```

### Result Pattern

The service layer never throws errors directly.

Every service function returns a typed result object:

```ts
type DataResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

This keeps error handling predictable throughout the application.

### State Management

Talkie uses multiple Zustand stores separated by responsibility:

| Store          | Responsibility               |
| -------------- | ---------------------------- |
| `profileStore` | User profiles and avatars    |
| `commentStore` | Timestamp comments and feeds |
| `reviewStore`  | Reviews and ratings          |
| `listStore`    | Lists and list items         |
| `followStore`  | Follow relationships         |
| `blockStore`   | User blocking system         |
| `mediaStore`   | Cached media metadata        |
| `uiStore`      | Temporary UI state           |

### Authentication Flow

```txt
App Launch
  └── AuthProvider initializes session
        ├── No session → Sign-in flow
        ├── Active session → Hydrate stores in parallel
        └── Deleted account → Restoration screen
```

---

## Database Design

The PostgreSQL schema is managed through Supabase and protected using Row-Level Security policies.

### Key Design Decisions

* A single `comments` table supports both movie timestamps and TV episode comments
* Custom lists are capped at 5 per user using database triggers
* Profiles use soft deletion for restoration support
* Media metadata is cached inside Supabase instead of fetched directly from TMDB on-device
* Blocked-user filtering is enforced inside database functions and RPCs

### Core Tables

```txt
profiles
media
user_media
lists
list_items
comments
comment_likes
reviews
review_likes
follows
blocks
reports
feedback
bug_reports
```

---

## Engineering Decisions

### Why Timestamp-Based Comments?

Most media apps focus on general reviews and reactions.

Talkie instead focuses on scene-specific interaction by attaching discussion directly to playback moments.

### Why Zustand?

Zustand provides lightweight global state management without the boilerplate and complexity of Redux.

### Why Supabase?

Supabase provides:

* PostgreSQL with relational modeling
* Built-in authentication
* Row-Level Security
* Edge Functions
* Storage

This allowed the backend to stay fully typed and centralized.

### Why a Layered Architecture?

Separating services, stores, and UI components keeps the codebase maintainable as the application scales.

This also prevents database logic from leaking into presentation components.

---

## Getting Started

### Prerequisites

* Node.js
* npm
* Expo CLI
* Supabase project

### Installation

```bash
git clone <repository-url>
cd talkie
npm install
```

### Environment Variables

Create a `.env` file using `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Run the App

```bash
npm run start
```

iOS:

```bash
npm run ios
```

Android:

```bash
npm run android
```

---

## Project Status

Talkie is currently in active development and testing.

Planned improvements include:

* Expanded onboarding flow
* Push notifications
* Better recommendation systems
* Performance optimizations
* Additional social discovery features

---

## Environment Variables

Example `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Never commit your real `.env` file.

---

## Author

**Ana Garcia**

Full-Stack Mobile Developer

* GitHub: [https://github.com/anagarcia3174](https://github.com/anagarcia3174)

---

<div align="center">
<sub>Built with React Native · Expo · Supabase · TypeScript</sub>
</div>
