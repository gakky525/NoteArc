import EditLog from '@/components/EditLog';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';
import { notFound } from 'next/navigation';

type PageProps = {
  params?: Promise<{ id: string }>;
};

export default async function EditLogPage({ params }: PageProps) {
  const resolved = await params;
  const id = resolved?.id;
  if (!id) {
    notFound(); // id が無ければ 404
  }

  await connectToDatabase();
  const log = await Log.findById(id).lean();

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
  };

  return <EditLog log={serializedLog} />;
}
