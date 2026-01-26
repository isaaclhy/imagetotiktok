This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## TikTok Integration Setup

To enable posting to TikTok, you need to:

1. **Register a TikTok Developer Account**
   - Go to [TikTok for Developers](https://developers.tiktok.com/)
   - Create an account and register your application
   - Get approval for Content Posting API access

2. **Get Your Credentials**
   - After approval, you'll receive:
     - Client Key
     - Client Secret

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   TIKTOK_REDIRECT_URI=http://localhost:3000/api/tiktok/callback
   ```
   
   For production, update the redirect URI to your production domain.

4. **Photo Post API (optional)**
   We use TikTok’s **Photo Post API** (`/v2/post/publish/content/init/`) so you can post **images** (e.g. card graphics) as photos instead of video.

   **Requirements:**
   - **Vercel Blob** – Images are uploaded to a Blob store to get public URLs. TikTok pulls from these URLs (`PULL_FROM_URL`).
   - **URL verification** – The Blob store domain must be verified in the TikTok Developer Portal.

   **Setup:**
   - Create a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store and add `BLOB_READ_WRITE_TOKEN` to your env (local and Vercel).
   - In [TikTok for Developers](https://developers.tiktok.com/) → your app → **Manage URL properties**, add and verify the Blob store domain (e.g. `https://<your-store>.public.blob.vercel-storage.com` or the base URL shown in your Blob dashboard).

   **Flow:**
   - "Post to TikTok" sends the generated card image to `/api/tiktok/post-photo`.
   - The route uploads the image to Vercel Blob, gets a public URL, then calls TikTok’s content init with `media_type: PHOTO`, `post_mode: DIRECT_POST`, and `source: PULL_FROM_URL` + `photo_images: [url]`.
   - Posts use `privacy_level: SELF_ONLY` (private) by default.

5. **How It Works**
   - Click "Post to TikTok" and authorize the app when redirected to TikTok.
   - The current card image is posted as a **photo** to your TikTok account (private by default).
