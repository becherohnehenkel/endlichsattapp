import { redirect } from 'next/navigation'

export default async function AdminRezeptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/rezepte/${id}/bearbeiten`)
}
