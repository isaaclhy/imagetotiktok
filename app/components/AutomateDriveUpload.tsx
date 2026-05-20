'use client';

import { useCallback, useEffect, useState } from 'react';

type DriveStatus = {
  oauthConfigured?: boolean;
  connected?: boolean;
};

function readDriveAuthFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('drive_auth');
  if (!auth) return null;
  const error = params.get('drive_error');
  params.delete('drive_auth');
  params.delete('drive_error');
  const next = params.toString();
  const path = window.location.pathname + (next ? `?${next}` : '');
  window.history.replaceState({}, '', path);
  if (auth === 'error') return error || 'Connection failed';
  return null;
}

export function AutomateDriveUpload() {
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; link?: string } | null>(null);

  const refreshStatus = useCallback(() => {
    return fetch('/api/drive/status')
      .then((r) => r.json())
      .then((data: DriveStatus) => {
        setOauthConfigured(Boolean(data.oauthConfigured));
        setConnected(Boolean(data.connected));
      })
      .catch(() => {
        setOauthConfigured(false);
        setConnected(false);
      });
  }, []);

  useEffect(() => {
    const authError = readDriveAuthFromUrl();
    if (authError) setError(authError);
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
    setSuccess(null);
  }, []);

  const onConnect = useCallback(() => {
    window.location.href = '/api/drive/auth';
  }, []);

  const onDisconnect = useCallback(async () => {
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/drive/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setConnected(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  }, []);

  const onUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { error?: string; name?: string; webViewLink?: string };
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess({ name: data.name || file.name, link: data.webViewLink });
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [file]);

  const canUpload = connected && oauthConfigured !== false;

  return (
    <div className="h-full min-h-[320px] rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-5 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Upload to Google Drive</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Connect your Google account once. Uploads go to your folder and sync to your phone.
        </p>
      </div>

      {oauthConfigured === false && (
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          OAuth is not configured. Add <code className="text-xs">GOOGLE_CLIENT_ID</code>,{' '}
          <code className="text-xs">GOOGLE_CLIENT_SECRET</code>, and{' '}
          <code className="text-xs">GOOGLE_DRIVE_FOLDER_ID</code> to <code className="text-xs">.env.local</code> — see{' '}
          <code className="text-xs">GOOGLE_DRIVE_SETUP.md</code>.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {connected ? (
          <>
            <span className="inline-flex items-center text-sm text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
              Google Drive connected
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              disabled={disconnecting}
              className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={oauthConfigured === false}
            className="text-sm px-4 py-2 rounded-lg bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Google Drive
          </button>
        )}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={!canUpload}
          className="text-sm text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 disabled:opacity-50"
        />
      </label>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-h-48 w-auto rounded-lg border border-zinc-200 dark:border-zinc-700 object-contain"
        />
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {success && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Uploaded <span className="font-medium">{success.name}</span>.
          {success.link ? (
            <>
              {' '}
              <a href={success.link} target="_blank" rel="noopener noreferrer" className="underline">
                Open in Drive
              </a>
            </>
          ) : null}
        </p>
      )}

      <button
        type="button"
        onClick={onUpload}
        disabled={!file || uploading || !canUpload}
        className="mt-auto w-full py-3 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading…' : 'Upload to Drive'}
      </button>
    </div>
  );
}
