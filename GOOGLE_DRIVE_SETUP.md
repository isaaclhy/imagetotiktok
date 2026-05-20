# Google Drive upload (OAuth)

Upload images from the **Automate** tab into a folder on **your** Google Drive. Your phone syncs via the Drive app.

## 1. Google Cloud setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. **APIs & Services → Enable APIs** → enable **Google Drive API**.
4. **APIs & Services → OAuth consent screen** → configure (External is fine for personal use; add yourself as a test user while in Testing).
5. **Credentials → Create credentials → OAuth client ID** → type **Web application**.
6. **Authorized redirect URIs** — add exactly:
   - `http://localhost:3000/api/drive/callback` (local dev)
   - Your production URL + `/api/drive/callback` when you deploy

Copy the **Client ID** and **Client secret**.

## 2. Pick your upload folder

1. In Google Drive, create or open the folder you want (e.g. `Bleamies phone sync`).
2. Copy the **folder ID** from the URL:
   - `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

No need to share the folder with a service account — uploads run as **you** after you connect.

## 3. Environment variables

In `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Optional — must match a redirect URI registered in Google Cloud
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
```

Restart `npm run dev` after changes.

You can remove old service account vars (`GOOGLE_SERVICE_ACCOUNT_*`) if you had them.

## 4. Use the app

1. Open the **Automate** tab.
2. Click **Connect Google Drive** and sign in (once per browser; token stored ~30 days).
3. Choose an image → **Upload to Drive**.
4. The file appears in your folder; your phone’s Drive app syncs it.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| OAuth not configured | Set client ID, secret, and folder ID; restart dev server |
| `redirect_uri_mismatch` | `GOOGLE_REDIRECT_URI` must match Google Cloud **exactly** |
| Not connected | Click **Connect Google Drive** before uploading |
| Insufficient permissions | Reconnect; ensure Drive API is enabled |
| File not in folder | Check `GOOGLE_DRIVE_FOLDER_ID` |
| App blocked (Testing) | Add your Google email under OAuth consent screen → Test users |
