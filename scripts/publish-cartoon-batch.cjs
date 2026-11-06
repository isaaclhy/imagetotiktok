/**
 * Uploads the ten girlfriend quiz MP4s to Blob before `next build`
 * when BLOB_READ_WRITE_TOKEN is present, and writes their URLs for the
 * library seed. Without the token, the committed published.json is left alone.
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const dir = path.join(process.cwd(), 'data', 'cartoon-batch');
  const publishedPath = path.join(dir, 'published.json');
  if (!token) {
    if (!fs.existsSync(publishedPath)) {
      fs.writeFileSync(publishedPath, JSON.stringify({ items: [] }, null, 2));
    }
    console.log('[cartoon-batch] no Blob token at build; leaving published.json unchanged');
    return;
  }

  let put;
  try {
    ({ put } = require('@vercel/blob'));
  } catch (error) {
    console.error('[cartoon-batch] blob client unavailable', error instanceof Error ? error.message : error);
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const items = [];
  for (const item of manifest) {
    try {
      const body = fs.readFileSync(path.join(dir, item.file));
      const blob = await put(`cartoon-batch/${item.file}`, body, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'video/mp4',
        token,
      });
      items.push({
        ...item,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
      });
      console.log('[cartoon-batch] published', item.file);
    } catch (error) {
      console.error(
        '[cartoon-batch] skipped',
        item.file,
        error instanceof Error ? error.message : 'upload failed'
      );
    }
  }
  if (items.length === manifest.length) {
    fs.writeFileSync(publishedPath, JSON.stringify({ items }, null, 2));
  } else {
    console.error(`[cartoon-batch] published ${items.length} of ${manifest.length}; leaving library seed unchanged`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
