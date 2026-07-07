import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ tableNumber: string }> }) {
  const p = await params;
  redirect(`/table/${p.tableNumber}?view=cart`);
}
