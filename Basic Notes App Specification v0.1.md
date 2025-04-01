## Notes Application Specification

### Tech Stack
- **Frontend**: Next.js (App Router), React (with Server Components), TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Icons**: Lucide React
- **Authentication**: Clerk
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon via Vercel)
- **Deployment**: Vercel
- **Data Fetching**: React Query (no REST API routes)


### Functional Requirements

#### Authentication
- The first page a user sees is the **Sign In** page.
- The Sign In page must include a link to the **Sign Up** (registration) page.
- Only authenticated users can access the notes system.
- If a user logs out, they are redirected back to the Sign In page.
- Use Clerk to manage authentication, sessions, and route protection.
- Dark/Light mode toggle is included in the Clerk user menu.
- Theme persists across sessions.


### Data Models

#### Note
- `id`, `userId`, `title`, `content`, `date`, `tags` (many-to-many with `Tag`)

#### Tag
- `id`, `userId`, `name` (unique per user)
- Can\'92t be deleted if used on a note

---

### UI Pages & Features

#### Dashboard (Main Notes View)

- **Filter Bar**
  - Text search (title/content)
  - Tag filter (dropdown)
  - Date filter (datepicker)
  - Sort dropdown: Title A\' / Z', Date Newest / Oldest

- **Notes Table**
  - Shows: `Title`, `Date`, `Excerpt`, `Tags`, `Actions`
  - Actions: Edit (modal), Delete (confirm dialog), **Download as PDF**
  - Create Note button on top right of filter bar

- **Pagination**
  - Fixed at bottom of viewport
  - Prev / Next buttons with current page shown
  - State reflected in URL (`/dashboard?page=2&sort=date_desc`)

#### Note Create / Edit Modal
- Fields: `Title`, `Content`, `Date`, `Tags`
- Buttons: Save / Cancel
- Form validation required

#### Delete Confirmation
- '93Are you sure you want to delete this note?`
- Cancel / Delete (destructive)

#### Tags Management Page
- View/edit/delete tags
- Delete disabled if tag is in use

---

### PDF Export

#### Export Button
- Each note row includes a **Download as PDF** icon/button.
- Opens a PDF download with the full note content:
  - Title
  - Date
  - Tags
  - Full content
  - Exported on: `[current date]`

#### Implementation Notes
- Use `@react-pdf/renderer` or `html2pdf.js`
- Filename: `note-title.pdf` (safe-slugged)
- Optional: Add branding (e.g. logo/text footer)
- PDF styling matches light mode for clean print

---


### Sample PDF Layout

```
------------------------------------------------------
                 [ Your App Name or Logo ]
------------------------------------------------------

Note Title: How to Build a Notes App  
Date: 28 Mar 2025  
Tags: tech, react, notes  

------------------------------------------------------
Content:

This is a full example of what a note might look like.
It can span multiple lines, contain long paragraphs, etc.

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Curabitur nec lorem id nulla blandit lacinia.

[... more content ...]

-----------------------------------------------------
Exported on: 28 Mar 2025
```