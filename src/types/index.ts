export type Log = {
  _id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  format: 'plain' | 'markdown';
  folderId?: string;
  userId?: string;
  _isGuest?: boolean;
};
