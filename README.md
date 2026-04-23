# File Uploader (ShareFY)

A full-stack file management web app built as the **File Uploader Assignment from The Odin Project**.

This is my most complex project yet: from concept and UI design to backend architecture, database modeling, authentication/authorization, cloud file integration, and public sharing workflows.

![ShareFY Dashboard](public/dashboard.png)

## Authorship Note

I made this project **95% without using AI**.

I designed and implemented the major parts myself end-to-end:

- product design and feature planning
- UI structure and styling
- backend architecture and route/controller/service structure
- database schema and migration workflow
- API integration with Cloudinary
- authentication and authorization system
- protected/private and public sharing flows

## Project Identity

**Name:** ShareFY (File Uploader)

**Core idea:**

- Authenticated users create folders
- Upload files inside folders
- Rename/delete files and folders
- Download private files securely
- Generate expiring public share links for files or whole folders

## Why This Project Matters

This project goes beyond basic CRUD. It combines:

- session-based auth with Passport
- ownership-based authorization
- cloud storage + signed private downloads
- relational data modeling with Prisma
- expiring share links with scheduled cleanup
- validation and error boundaries across the request lifecycle

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5
- **Templating:** EJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Passport (local strategy) + express-session
- **Session Store:** Prisma session store (`@quixo3/prisma-session-store`)
- **File Upload Parser:** Multer
- **Cloud Storage:** Cloudinary API
- **Validation:** express-validator
- **Scheduler:** node-cron
- **Styling/Frontend:** Vanilla JS + CSS + EJS views

## Architecture Overview

The app follows a clean layered structure:

- **Routes** define URL contracts
- **Controllers** handle request/response orchestration
- **Services** encapsulate reusable database/business logic
- **Utils** encapsulate reusable low-level I/O helpers (download streaming)
- **Validators** enforce input constraints
- **Middleware** handles auth guarding, user context, and global errors
- **Prisma layer** handles typed persistence
- **Cloudinary integration** handles external file hosting and signed file delivery

### High-level request flow

1. Request enters Express app.
2. Session middleware restores session from Prisma store.
3. Passport deserializes the user (if logged in).
4. `userMiddleware` injects `currentUser` into `res.locals` for EJS.
5. Route-level middleware (`isAuth`) guards protected resources.
6. Validators run and normalize input.
7. Controller executes business flow (DB + Cloudinary).
8. Result is rendered in EJS view or returned as file download.
9. Errors are centralized through global `errorMiddleware`.

## Project Structure

```text
src/
  config/
    passport.ts               # Local strategy + serialize/deserialize
  controllers/
    auth.controller.ts
    file.controller.ts
    folder.controller.ts
    home.controller.ts
    publicshare.controller.ts
  lib/
    multer.ts                 # Upload destination + 10MB upload cap
    prisma.ts                 # Prisma + PostgreSQL adapter
  middleware/
    auth.middleware.ts        # Route protection via req.isAuthenticated()
    error.middleware.ts       # Central error rendering
    user.middleware.ts        # Expose currentUser to templates
  routes/
    auth.router.ts
    file.router.ts
    folder.router.ts
    home.router.ts
    publicshare.router.ts
  services/
    file.service.ts           # Upload workflow + quota check + Cloudinary metadata persistence
    folder.service.ts         # Folder queries + user metrics
  utils/
    file.stream.ts            # Shared Cloudinary-to-local streaming + res.download delivery
  validators/
    file.validator.ts
    folder.validator.ts
    user.validator.ts
  index.ts                    # App bootstrap + middleware + routes + cron

prisma/
  schema.prisma               # Data model
  migrations/                 # Migration history

views/                        # EJS templates
public/                       # Static CSS/JS/icons
uploads/                      # Temporary local upload buffer (pre-cloud)
downloads/                    # Temporary local download buffer
```

## Data Model

Prisma models represent users, folders, files, share links, and session persistence.

### Core entities

- **User** owns many folders and files.
- **Folder** belongs to one user and has many files.
- **File** belongs to one user and one folder.
- **FolderShare** is a public share token with expiry for a folder.
- **FileShare** is a public share token with expiry for a single file.
- **Session** stores express-session data in PostgreSQL.

### Share uniqueness guarantees

- One active share record per user-folder pair: `@@unique([folderID, userID])`
- One active share record per user-file pair: `@@unique([fileID, userID])`

This prevents duplicate share rows for the same resource-owner pair.

## Authentication and Authorization

### Authentication

- Local auth strategy with `email + password`
- Passwords are hashed with bcrypt before storage
- Login uses Passport local strategy
- Sessions are persisted in PostgreSQL through Prisma session store

### Authorization

Authorization is ownership-first:

- Protected routers (`/folder`, `/file`) are wrapped in `isAuth`
- Resource operations always include `userID`/`authorID` checks in Prisma queries
- Unauthorized access returns error pages (401/403/404 based on context)

## File Upload, Storage, and Download Pipeline

### Upload flow

1. Multer accepts the file (`uploadedFile`) into local `uploads/`.
2. Request is validated (`fileUploadRules`).
3. `FileService.uploadFile()` aggregates user storage from DB.
4. If new upload exceeds quota, request is denied.
5. Service uploads to Cloudinary (`type: private`).
6. Service persists metadata in Prisma (`public_id`, `resource_type`, `version`, size, ext, etc.).
7. Controller always deletes local temporary upload file in `finally` cleanup.

### Storage limits

- **Per file limit (Multer):** 10MB
- **Per account logical quota:** 50MB (in total)

### Download flow (owner/private)

1. Verify file ownership in DB.
2. Delegate stream/download work to `FileStreamUtil.downloadFile()`.
3. Utility generates signed Cloudinary URL for private asset download.
4. Utility streams remote file into local `downloads/` using a unique temporary filename (collision-safe).
5. Utility serves via `res.download()` using the clean user-facing filename (`name.ext`).
6. Utility deletes temporary local file after response.

The same download utility is used by:

- private owner downloads (`/file/:id/download`)
- public shared-file downloads (`/publicshare/file/:shareID/download`)
- shared-folder file downloads (`/publicshare/folder/:shareID/file/:fileID/download`)

## Public Sharing System

The app supports two public link types:

- **Folder share:** public access to folder listing + file downloads within that folder
- **File share:** public access to one file + download

### Link creation

- User chooses expiry duration (1-60 days)
- Controller computes `expiresAt`
- Share record is created in DB

### Access enforcement

- Public routes validate share ID existence and expiry (`expiresAt > now`)
- Shared-folder file download additionally checks that file belongs to shared folder

### Link cleanup

A cron job runs daily at UTC midnight and removes expired records from:

- `FolderShare`
- `FileShare`

This keeps the public link surface short-lived and controlled.

## Validation Strategy

Validation is handled with `express-validator` and follows route context:

- **User validation**
  - Non-empty first/last name
  - Email format and uniqueness
  - Password confirmation match
- **Folder validation**
  - Folder name required and max length
  - Share duration integer constraints
- **File validation**
  - Optional upload rename constraints
  - Edit filename and folder ID checks
  - Share duration integer constraints

When validation fails, forms re-render with `errors` and previous input where relevant.

## Route Map

### Public routes

- `GET /` -> Landing page
- `GET /auth/sign-up` -> Sign-up form
- `POST /auth/sign-up` -> Register user
- `GET /auth/log-in` -> Login form
- `POST /auth/log-in` -> Authenticate user
- `GET /auth/log-out` -> Logout
- `GET /publicshare/folder/:shareID` -> View shared folder
- `GET /publicshare/folder/:shareID/file/:fileID/download` -> Download file from shared folder
- `GET /publicshare/file/:shareID` -> View shared file
- `GET /publicshare/file/:shareID/download` -> Download shared file

### Protected routes (`isAuth`)

#### Folder routes

- `GET /folder/all` -> Dashboard + folder list + metrics
- `POST /folder/new` -> Create folder
- `POST /folder/:id/edit` -> Rename folder
- `POST /folder/:id/delete` -> Delete folder
- `POST /folder/:id/file` -> Upload file to folder
- `POST /folder/:id/share` -> Create folder share link
- `GET /folder/:id/share/delete` -> Revoke folder share link
- `GET /folder/:id` -> Open folder page

#### File routes

- `POST /file/:id/edit` -> Rename file
- `POST /file/:id/delete` -> Delete file
- `GET /file/:id/download` -> Private owner download
- `POST /file/:id/share` -> Create file share link
- `GET /file/:id/share/delete` -> Revoke file share link

## Frontend Architecture (Client-Side + EJS)

The frontend is intentionally **server-rendered first** with EJS, then enhanced with a strong client-side interaction layer in `public/script.js`.

### Rendering strategy

- EJS renders pages on the server with real user/session context (`currentUser`, folder/file data, metrics, errors).
- Shared partials (like header and error blocks) keep UI consistent across pages.
- Views are purpose-driven:
  - `landing.ejs` for product/marketing entry
  - `sign-up.ejs` and `log-in.ejs` for auth flow
  - `folders.ejs` for dashboard metrics + folder management
  - `folder.ejs` for file operations inside a folder
  - `sharedfolder.ejs` and `sharedfile.ejs` for public share access

### Why `script.js` is critical

`public/script.js` acts as the UI behavior engine and controls much of the interactive experience:

- Header behavior on scroll (`.scrolled` class toggle)
- Dialog lifecycle management for folder/file actions:
  - create
  - edit
  - delete
  - share
- Dynamic form target rewriting (injecting correct resource IDs into form actions)
- Reusable custom dropdown system (`CustomDropDownMenu` + `ActionItem`) for per-card action menus
  - `CustomDropDownMenu` is from my own npm package that I had released months before this project
  - I customized its UI/UX behavior and styling specifically for ShareFY
- Share-link UX orchestration:
  - switching between create mode and already-shared mode
  - copy-to-clipboard for public URLs
  - expiry countdown display in days
  - delete-link action wiring
- Client-side guardrails before upload:
  - max file size check (10MB)
  - max filename length check
- Client-side date localization:
  - UTC timestamps rendered by server are formatted into user-friendly local dates in-browser

### Data handoff between EJS and JS

- EJS embeds resource metadata into `data-*` attributes on menu buttons (`data-folder-id`, `data-file-share-id`, etc.).
- `script.js` reads those attributes and builds context-aware UI actions at runtime.
- This keeps the server responsible for trusted data and the client responsible for interaction ergonomics.

### Frontend design approach

- Multi-page app architecture (MPA) over SPA complexity.
- Fast first render from server templates.
- Progressive enhancement on top of semantic HTML dialogs/forms.
- No heavy frontend framework dependency; behavior remains transparent and maintainable.

## Environment Variables

Create `.env` based on `.env.example`.

Required values:

```env
PORT=3500
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
SESSION_SECRET="replace_with_a_secure_secret"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`.

3. Run Prisma migrations (development):

```bash
npx prisma migrate dev
```

4. Generate Prisma client (optional, `migrate dev` usually generates automatically):

```bash
npx prisma generate
```

5. Start development server:

```bash
npm run dev
```

6. Open the app:

```text
http://localhost:3500
```

## Build and Run (Production style)

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` -> run app in watch mode with `tsx`
- `npm run build` -> compile TypeScript to `dist/`
- `npm start` -> run compiled server from `dist/index.js`

## Assignment Context

This project was created as the **File Uploader project from The Odin Project** and intentionally pushes beyond the minimum assignment baseline:

- stronger data modeling
- robust auth and protected route layering
- cloud-based private/public file delivery patterns
- expiring share-link lifecycle management
- production-minded cleanup and error handling patterns

## Status

**Version:** 1.0

This is currently the most complex project in my Odin journey, and it represents a major step in full-stack system design, backend architecture, and real-world integration work.
