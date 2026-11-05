import { del, put, BlobNotFoundError } from '@vercel/blob';
import { ObjectId } from 'mongodb';
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
