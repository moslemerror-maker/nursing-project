# Nursing Assessment Portal

A starter web application for hospital nursing pre-tests/post-tests.

## Included
- Public assessment link suitable for a shared QR code; participants do not need Google accounts.
- Participant identity fields: full name, employee ID, department, designation.
- Admin login using Supabase Auth.
- Create multiple assessments (e.g. Nursing Pre-Test and Nursing Post-Test).
- Upload a hospital logo per assessment.
- Add MCQ questions, options, correct answer and marks per question.
- Server-side automatic grading. Correct answers are not sent to the participant's browser.
- Store every participant response, selected answers, score and timestamp in Supabase.
- Admin results list with search, CSV export, and expandable participant-specific answer review.

## Architecture
- Next.js application (deploy on Vercel or Netlify)
- Supabase PostgreSQL database, Auth and Storage
- Server-side grading API uses the Supabase service-role key.

## 1. Create Supabase project
1. Create a project at https://supabase.com.
2. Open SQL Editor and run all of `supabase/schema.sql`.
3. In Authentication > Users, create an administrator user with the email/password you will use. Disable public sign-ups in Authentication settings; only create authorised administrator accounts.
4. Copy Project URL and anon/public key from Project Settings > API.
5. Copy the service_role key from the same API settings. Keep it secret.

## 2. Configure local environment
Copy `.env.example` to `.env.local`, then fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` (the administrator email created above)

Never put the service role key in a variable beginning `NEXT_PUBLIC_`, commit it to Git, or share it.

## 3. Run locally
Requires Node.js 20 or newer.
```bash
npm install
npm run dev
```
Open http://localhost:3000. Go to `/admin/login`, sign in, create a quiz, add questions, then publish it. Public quiz links appear at `/test/QUIZ_UUID`.

## 4. Deploy
### Vercel
1. Push this project to a private GitHub repository.
2. Import it at https://vercel.com/new.
3. Add the four environment variables from `.env.local` in Project Settings > Environment Variables.
4. Deploy. Redeploy after changing environment variables.

### Netlify
1. Import the repository at https://app.netlify.com.
2. Set build command `npm run build`.
3. Set publish directory as handled by the Next.js Runtime/OpenNext adapter; use Netlify's Next.js framework detection.
4. Add the same environment variables in Site configuration > Environment variables.
5. Deploy. If the Next.js runtime adapter fails, Vercel is the simpler recommended host for this starter.

## 5. QR code
After deployment, copy the public URL:
`https://YOUR-DOMAIN/test/QUIZ_UUID`
Generate a QR code for this exact URL and print it.

## Important production hardening before real hospital use
This is a functional starter, not yet a certified or fully hardened hospital assessment system.
- The sample SQL grants admin CRUD to any authenticated Supabase user. Create only the intended admin account; before production, replace this with a dedicated `admin_users` table and restrictive RLS policies, or use server-side admin APIs that verify the allowlisted admin identity for every mutation.
- Add CAPTCHA/rate limiting and duplicate-attempt policy (e.g. employee ID + quiz ID) if needed.
- Decide whether multiple attempts are allowed. Current app allows multiple submissions and records each one.
- Validate file size/type for logos and consider limiting SVG uploads to trusted files.
- Back up the Supabase database and restrict dashboard access.
- Do not use this starter to store patient-identifiable clinical information. It is intended for staff training assessments only.
- Test with dummy participants before distributing the QR code.
- Review applicable hospital IT/security and Indian data-protection requirements before production deployment.

## Current limitations
- Four answer-option fields per question in the admin builder.
- Questions can be added and deleted; editing an existing question and reordering questions are not yet implemented.
- Results list includes expandable participant-specific answer review, showing each selected answer against the correct answer. Raw answers are also stored in `submissions.answers`.
- Public assessment currently displays score only after submission.
