import { adminDb } from '@/lib/supabase-admin';
import Link from 'next/link';

export default async function Home() {
  const db = adminDb();
  const { data: quizzes } = await db.from('quizzes').select('id,title,description,logo_url,is_published').eq('is_published', true).order('created_at', { ascending: false });
  return <main className="shell">
    <section className="panel">
      <h1>Nursing Assessment Portal</h1>
      <p className="muted">Select an assessment to begin. Please enter your employee details accurately.</p>
      {!quizzes?.length && <p>No published assessments are available yet.</p>}
      {quizzes?.map(q => <div className="question" key={q.id}>
        <div className="top">{q.logo_url && <img className="logo" src={q.logo_url} alt="Hospital logo"/>}<div><h2>{q.title}</h2><p className="muted">{q.description}</p></div></div>
        <Link className="btn" href={`/test/${q.id}`}>Start assessment</Link>
      </div>)}
      <p className="small muted"><Link href="/admin">Administrator login</Link></p>
    </section>
  </main>;
}
