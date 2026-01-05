import { redirect } from 'next/navigation';

export default function InviteRedirectPage({ params }: { params: { code: string } }) {
  redirect(`/join/${params.code}`);
}
