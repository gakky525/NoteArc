import EditLog from '@/components/EditLog';
import { connectToDatabase } from '@/lib/mongodb';
import { Log as LogModel } from '@/models/Log';
import { notFound } from 'next/navigation';

type PageProps = {
  params?: Promise<{ id: string }>;
};

export default async function EditLogPage({ params }: PageProps) {
  const resolved = await params;
  const id = resolved?.id;
  if (!id) {
    notFound();
  }

  await connectToDatabase();
  const log = await LogModel.findById(id).lean();

  if (!log) {
    notFound();
  }

  const serializedLog = {
    _id: log._id.toString(),
    title: log.title,
    content: log.content,
    date:
      log.date instanceof Date
        ? log.date.toISOString()
        : new Date(log.date ?? Date.now()).toISOString(),
    tags: Array.isArray(log.tags) ? log.tags : [],
    format: (log.format as 'plain' | 'markdown') ?? 'plain',
    userId: typeof log.userId === 'string' ? log.userId : undefined,
  };

  return <EditLog log={serializedLog} />;
}
