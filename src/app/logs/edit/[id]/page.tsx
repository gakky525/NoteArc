import EditLog from '@/components/EditLog';
import { connectToDatabase } from '@/lib/mongodb';
import { Log } from '@/models/Log';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLogPage({ params }: Props) {
  const { id } = await params;
  await connectToDatabase();
  const log = await Log.findById(id).lean();

  if (!log) {
    return <p>ログが見つかりません</p>;
  }

  const serializedLog = {
    _id: log._id.toString(),
    title: log.title,
    content: log.content,
    date: log.date.toISOString(),
    tags: log.tags || [],
  };

  return <EditLog log={serializedLog} />;
}
