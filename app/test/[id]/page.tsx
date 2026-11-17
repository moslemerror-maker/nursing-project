import { adminDb } from '@/lib/supabase-admin';
import TestForm from './test-form';
import { notFound } from 'next/navigation';

export default async function TestPage({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const db = adminDb();
  const { data: quiz } = await db.from('quizzes').select('id,title,description,logo_url').eq('id', id).eq('is_published', true).single();
  if (!quiz) notFound();
  const { data: questions } = await db.from('questions').select('id,prompt,options,sort_order').eq('quiz_id', id).order('sort_order');
  return <main className="shell"><section className="panel">
    <div className="top">{quiz.logo_url && <img className="logo" src={quiz.logo_url} alt="Logo"/>}<div><h1>{quiz.title}</h1><p className="muted">{quiz.description}</p></div></div>
    <TestForm quizId={quiz.id} questions={questions || []}/>
  </section></main>;
}
