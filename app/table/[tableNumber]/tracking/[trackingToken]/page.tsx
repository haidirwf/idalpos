import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ tableNumber: string; trackingToken: string }> }) {
  const p = await params;
  redirect(`/table/${p.tableNumber}?view=tracking&token=${p.trackingToken}`);
}
