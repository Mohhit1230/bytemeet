import { redirect } from 'next/navigation';
import { use } from 'react';

export default function InviteRedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  redirect(`/join/${code}`);
}
