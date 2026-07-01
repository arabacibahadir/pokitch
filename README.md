# Pokitch

Pokitch is an interactive Twitch chat game that streamers can add as an overlay to their live streams.

Homepage: [pokitch.app](https://pokitch.app)

Online overlay demo: [pokitch.app/overlays/:id](https://pokitch.app/overlays/fc439c64-7a77-4808-99e8-ae35b075a394)

## Features

- Twitch Bot
- Stream overlay

## Demo video

https://user-images.githubusercontent.com/32988819/208307217-91159b3a-e0bf-4cfc-8a4c-c329b0cfa8a6.mp4

## Instructions

**Step 1: Copy the overlay url**

> Go to [homepage](https://pokitch.app) and login. Copy the link we gave you after you signed in.

**Step 2: Open your broadcasting tool**

> Open your broadcasting tool and add a new browser source. Paste the overlay link into the URL field.

**Step 3: Set up the sizes**

> Width: 256, Height: 76. The dimensions should be set to 256x76.

**Step 4: Assign as moderator role**

> In order to use the bot properly, you must assign it as a 'mod' role: /mod pokitch_bot

**Step 5: And done!**

https://user-images.githubusercontent.com/32988819/208307876-4d941a2d-2bbd-4ee9-ad81-4faee840a921.mp4

## Brief

### How did we use _Supabase Realtime_ function?

We used Supabase Realtime for inserts and updates of poke's in our database. We used the event:"UPDATE" to check the realtime data of the active poke on the Twitch channel and update the overlay in realtime when its health is low. We used the event:"INSERT" to check if the active poke has been caught and swapped with the new random poke, and update the overlay with if there is the new data.

### How did we use _Supabase Database_?

Supabase Database is where we keep track of viewer poke collections and when on which Twitch channel they caught them.

## Tech-Stack

- [Supabase](https://supabase.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Typescript](https://www.typescriptlang.org/)
- [tmi.js](https://tmijs.com)
- [Tailwind CSS](https://tailwindcss.com/)
- [CVA](https://github.com/joe-bell/cva)
- [shadcn/ui](https://ui.shadcn.com/)

## Local development

Copy `.env.example` to `.env` and configure Supabase plus Twitch bot
credentials. The web application and Twitch bot run as separate processes:

```bash
npm install
npm run dev
npm run worker:dev
```

The bot credentials and Supabase secret key are server-only. Never prefix them
with `NEXT_PUBLIC_`.

## Database migration

Run the migrations and pgTAP suite locally first:

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

Apply the ordered SQL migrations to a Supabase development branch before
production. Then run `supabase/verification/secure_transfers.sql` and review
the security and performance advisors. The production rollout and rollback
gates are documented in [docs/operations.md](docs/operations.md).

## Docker

The web app and one long-lived Twitch bot process are deployed together:

```bash
docker compose up --build
```

## Work in progress

- [x] Inventory/Collection showcase
- [x] Support Trade/Gift system
- [ ] Store for Twitch channel loyalty points
- [ ] Brawl
- [ ] World Boss

* And more!
