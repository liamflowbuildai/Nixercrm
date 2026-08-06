# FlowBuild CRM

Internal project tracker for FlowBuild's side-job websites — pipeline board, project details, quick links, and to-dos. Not related to the main GoHighLevel CRM.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + new project.
2. In the Supabase dashboard, open the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `projects` and `project_tasks` tables.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. Go to **Authentication → Users** and click **Add user** to create a login for yourself (and anyone else on the team) — there's no public sign-up page, so accounts are only created this way.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values from step 1:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the account you created in step 1.

## 4. Deploy for free (Vercel)

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), create a free account, and import the repo.
3. When prompted, add the same two environment variables from step 2 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Vercel gives you a live URL your team can use from anywhere.

## Notes

- Project files (design assets, exports, etc.) aren't uploaded into the CRM — each project just stores a link to its Google Drive folder, so storage stays free and unlimited.
- Both `npm install` and `npm run dev`/`build` are configured to pull packages from the `registry.npmmirror.com` mirror (see `.npmrc`) because `registry.npmjs.org` was unreachable on the network this was built on. If your network can reach the npm registry directly, you can safely delete `.npmrc`.
