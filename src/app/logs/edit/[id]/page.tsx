import EditLog from '@/components/EditLog';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';
import { notFound } from 'next/navigation';

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function EditLogPage({ params }: PageProps) {
  const { id } = (await params) as { id: string };

  await connectToDatabase();
  const log = await Log.findById(id).lean();

  if (!log) {
    // 存在しなければnotFound（404ページ）へ
    notFound();
  }

  const serializedLog = {
    _id: log._id.toString(),
    title: log.title,
    content: log.content,
    date: log.date
      ? new Date(log.date).toISOString()
      : new Date().toISOString(),
    tags: Array.isArray(log.tags) ? log.tags : [],
  };

  return <EditLog log={serializedLog} />;
}
