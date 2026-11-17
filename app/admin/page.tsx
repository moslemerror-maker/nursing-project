import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
export default async function AdminPage() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if(!user) redirect('/admin/login');
  if(process.env.ADMIN_EMAIL && user.email?.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) return <main className="shell"><section className="panel"><h1>Access denied</h1><p>This account is not the configured administrator.</p></section></main>;
  return <main className="shell"><section className="panel"><div className="row between"><h1>Admin dashboard</h1><form action="/auth/signout" method="post"><button className="btn secondary">Sign out</button></form></div>
    <p>Manage assessments, questions, branding and results.</p><div className="row"><Link className="btn" href="/admin/quizzes">Manage quizzes</Link><Link className="btn secondary" href="/admin/results">View results</Link></div>
  </section></main>;
}
