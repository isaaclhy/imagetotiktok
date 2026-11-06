import { del, put, BlobNotFoundError } from '@vercel/blob';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ObjectId } from 'mongodb';
import path from 'path';
import publishedBatch from '@/data/cartoon-batch/published.json';
import type { SpillQuizTemplateId, SpillQuizTemplateKey } from '@/app/lib/spill-quiz/script';

export const VIDEO_LIBRARY_DB = 'bleamies';
export const VIDEO_LIBRARY_COLLECTION = 'dailyVideos';

export type VideoLibraryDoc = {
  _id: ObjectId;
  templateId: SpillQuizTemplateId;
  templateKey: SpillQuizTemplateKey;
  title: string;
  filename: string;
  blobUrl: string;
  blobPathname: string;
  day: string;
  lines: string[];
  createdAt: Date;
  /** Stable id for the one-time original seed. Daily clips omit this. */
  origin?: string;
  /** Basename under data/cartoon-originals when the file ships with the app. */
  bundledFile?: string;
};

export type VideoLibraryItem = {
  id: string;
  templateId: SpillQuizTemplateId;
  templateKey: SpillQuizTemplateKey;
  title: string;
  filename: string;
  day: string;
  lines: string[];
  createdAt: string;
};

async function collection() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('Missing MONGODB_URI');
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db(VIDEO_LIBRARY_DB).collection<VideoLibraryDoc>(VIDEO_LIBRARY_COLLECTION);
}

function toItem(doc: VideoLibraryDoc): VideoLibraryItem {
  return {
    id: doc._id.toString(),
    templateId: doc.templateId,
    templateKey: doc.templateKey,
    title: doc.title,
    filename: doc.filename,
    day: doc.day,
    lines: doc.lines,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function findDailyVideoForDay(
  templateKey: SpillQuizTemplateKey,
  day: string
): Promise<VideoLibraryDoc | null> {
  const docs = await collection();
  return docs.findOne({ templateKey, day });
}

export async function listVideoLibrary(): Promise<VideoLibraryItem[]> {
  const docs = await collection();
  const rows = await docs.find({}).sort({ createdAt: -1 }).limit(1000).toArray();
  return rows.map((row) => toItem(row));
}

export async function getVideoLibraryDoc(id: string): Promise<VideoLibraryDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const docs = await collection();
  return docs.findOne({ _id: new ObjectId(id) });
}

export async function saveDailyVideo(options: {
  templateId: SpillQuizTemplateId;
  templateKey: SpillQuizTemplateKey;
  title: string;
  filename: string;
  day: string;
  lines: string[];
  mp4: Buffer;
  origin?: string;
}): Promise<{ id: string; pathname: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error('Missing BLOB_READ_WRITE_TOKEN');

  const pathname = `daily-videos/${options.templateKey}/${options.day}/${options.filename}`;
  const blob = await put(pathname, options.mp4, {
    access: 'public',
    contentType: 'video/mp4',
    addRandomSuffix: true,
    token,
  });

  try {
    const docs = await collection();
    const createdAt = new Date();
    const _id = new ObjectId();
    await docs.insertOne({
      _id,
      templateId: options.templateId,
      templateKey: options.templateKey,
      title: options.title,
      filename: options.filename,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      day: options.day,
      lines: options.lines,
      createdAt,
      ...(options.origin ? { origin: options.origin } : {}),
    });
    return { id: _id.toString(), pathname: blob.pathname };
  } catch (error) {
    await del(blob.url, { token }).catch(() => undefined);
    throw error;
  }
}

export async function deleteVideoLibraryItem(id: string): Promise<boolean> {
  const doc = await getVideoLibraryDoc(id);
  if (!doc) return false;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token && doc.blobUrl) {
    try {
      await del(doc.blobUrl, { token });
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }
  }
  const docs = await collection();
  await docs.deleteOne({ _id: doc._id });
  return true;
}

const SEED_MARKER_ID = 'cartoon-originals-v1';
const BATCH_MARKER_ID = 'cartoon-binary-batch-v1';

const CARTOON_ORIGINALS = [
  {
    origin: 'seed:how-well-v15',
    templateId: 8 as const,
    templateKey: 'know-girlfriend' as const,
    title: 'How well do you know your girlfriend?',
    filename: 'how-well-girlfriend-v15.mp4',
    file: 'how-well-girlfriend-v15.mp4',
    lines: [
      'How well do you know your girlfriend?',
      'Girls!',
      'Send this to him!',
      'If he gets two wrong, he owes you unlimited kisses tonight!',
      'What is her favorite food?',
      'What is her favorite movie?',
      'What is her favorite drink order?',
      "What are her parents' names?",
      'Who is her best friend?',
      'When is her birthday?',
      'What is her favorite color?',
      "What is her pet's name?",
      'How many did he get?',
    ],
  },
  {
    origin: 'seed:quiz-girlfriend-v5b',
    templateId: 9 as const,
    templateKey: 'quiz-girlfriend' as const,
    title: 'Quiz your girlfriend',
    filename: 'quiz-girlfriend-v5b.mp4',
    file: 'quiz-girlfriend-v5b.mp4',
    lines: [
      'Quiz your girlfriend!',
      'Boys, send this to her.',
      'If she gets two wrong, she owes you a massage!',
      'What is his favorite food?',
      'What is his favorite video game?',
      "What are his parents' names?",
      'Who is his best friend?',
      'What is his favorite pastime?',
      'When is his birthday?',
      'What is his favorite sports team?',
      "What is his pet's name?",
      'How many did she get?',
    ],
  },
] as const;

function originalsDir(): string {
  return path.join(process.cwd(), 'data', 'cartoon-originals');
}

async function metaCollection() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('Missing MONGODB_URI');
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db(VIDEO_LIBRARY_DB).collection<{
    _id: string;
    status: 'seeding' | 'done';
    seededAt: Date;
  }>('videoLibraryMeta');
}

async function insertBundledOriginal(item: (typeof CARTOON_ORIGINALS)[number]): Promise<void> {
  const docs = await collection();
  const existing = await docs.findOne({ origin: item.origin });
  if (existing) return;
  const _id = new ObjectId();
  await docs.insertOne({
    _id,
    templateId: item.templateId,
    templateKey: item.templateKey,
    title: item.title,
    filename: item.filename,
    blobUrl: '',
    blobPathname: '',
    bundledFile: item.file,
    day: 'original',
    lines: [...item.lines],
    createdAt: new Date(),
    origin: item.origin,
  });
}

/**
 * Insert the two delivered cartoon MP4s once.
 * A finished marker stays after delete, so a refresh does not put them back.
 */
export async function ensureCartoonOriginals(): Promise<void> {
  const meta = await metaCollection();
  const now = new Date();
  const previous = await meta.findOneAndUpdate(
    { _id: SEED_MARKER_ID },
    { $setOnInsert: { status: 'seeding', seededAt: now } },
    { upsert: true, returnDocument: 'before' }
  );
  if (previous?.status === 'done') return;
  if (
    previous?.status === 'seeding' &&
    now.getTime() - new Date(previous.seededAt).getTime() < 2 * 60 * 1000
  ) {
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  for (const item of CARTOON_ORIGINALS) {
    const docs = await collection();
    const existing = await docs.findOne({ origin: item.origin });
    if (existing) continue;
    const filePath = path.join(originalsDir(), item.file);
    const mp4 = await fs.readFile(filePath);
    if (token) {
      try {
        await saveDailyVideo({
          templateId: item.templateId,
          templateKey: item.templateKey,
          title: item.title,
          filename: item.filename,
          day: 'original',
          lines: [...item.lines],
          mp4,
          origin: item.origin,
        });
        continue;
      } catch (error) {
        console.error('[video-library] blob seed failed, keeping the file in the deployment', error);
      }
    }
    await insertBundledOriginal(item);
  }
  await meta.updateOne({ _id: SEED_MARKER_ID }, { $set: { status: 'done', seededAt: new Date() } });
}

export function bundledCartoonPath(fileName: string): string | null {
  const base = path.basename(fileName);
  if (base !== fileName || !base.endsWith('.mp4')) return null;
  for (const dir of [originalsDir()]) {
    const full = path.join(dir, base);
    if (existsSync(full)) return full;
  }
  return null;
}

type SeedItem = {
  origin: string;
  templateId: 8 | 9;
  templateKey: 'know-girlfriend' | 'quiz-girlfriend';
  title: string;
  filename: string;
  file: string;
  lines: string[];
  day: string;
};

type PublishedSeedItem = SeedItem & { blobUrl?: string; blobPathname?: string };

async function seedPublishedBatch(items: PublishedSeedItem[]): Promise<void> {
  const meta = await metaCollection();
  const now = new Date();
  const previous = await meta.findOneAndUpdate(
    { _id: BATCH_MARKER_ID },
    { $setOnInsert: { status: 'seeding', seededAt: now } },
    { upsert: true, returnDocument: 'before' }
  );
  if (previous?.status === 'done') return;

  const docs = await collection();
  for (const item of items) {
    if (!item.blobUrl) continue;
    const existing = await docs.findOne({ origin: item.origin });
    if (existing) continue;
    await docs.insertOne({
      _id: new ObjectId(),
      templateId: item.templateId,
      templateKey: item.templateKey,
      title: item.title,
      filename: item.filename,
      blobUrl: item.blobUrl,
      blobPathname: item.blobPathname ?? '',
      day: item.day,
      lines: item.lines,
      createdAt: new Date(),
      origin: item.origin,
    });
  }
  const present = await docs.countDocuments({ origin: { $in: items.map((item) => item.origin) } });
  if (present >= items.length) {
    await meta.updateOne({ _id: BATCH_MARKER_ID }, { $set: { status: 'done', seededAt: new Date() } });
  }
}

/** Ten this-or-that editions. A separate marker from the original cartoons. */
export async function ensureBinaryBatch(): Promise<void> {
  const items = (publishedBatch.items ?? []) as PublishedSeedItem[];
  if (items.length > 0 && items.every((item) => item.blobUrl)) {
    await seedPublishedBatch(items);
  }
}
