'use client';
import { useState } from 'react';

type Q = {id:string;prompt:string;options:string[];sort_order:number};
export default function TestForm({quizId,questions}:{quizId:string;questions:Q[]}) {
  const [answers,setAnswers] = useState<Record<string,string>>({});
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState<{score:number;total:number;percentage:number}|null>(null);
  const [error,setError] = useState('');
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const fd = new FormData(e.currentTarget);
    const payload = {quizId,fullName:String(fd.get('fullName')||''),employeeId:String(fd.get('employeeId')||''),department:String(fd.get('department')||''),designation:String(fd.get('designation')||''),answers};
    try {
      const res = await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Submission failed');
      setResult(data);
    } catch(err) { setError(err instanceof Error?err.message:'Something went wrong'); }
    finally { setBusy(false); }
  }
  if(result) return <div className="success"><h2>Assessment submitted</h2><p>Your score</p><strong style={{fontSize:34}}>{result.score} / {result.total}</strong><p>{result.percentage}%</p><p className="muted">Your response has been recorded. Please contact the training administrator if you need assistance.</p></div>;
  return <form onSubmit={submit}>
    <h2>Participant details</h2>
    <label className="field">Full name *<input name="fullName" required maxLength={120}/></label>
    <label className="field">Employee ID *<input name="employeeId" required maxLength={60}/></label>
    <label className="field">Department *<input name="department" required maxLength={100} placeholder="e.g. Nursing / ICU / OT"/></label>
    <label className="field">Designation<input name="designation" maxLength={100}/></label>
    <hr/><h2>Questions</h2>
    {questions.map((q,i)=><div className="question" key={q.id}>
      <strong>{i+1}. {q.prompt}</strong>
      {q.options.map((opt,j)=><label className="option" key={j}><input type="radio" name={q.id} value={opt} required checked={answers[q.id]===opt} onChange={()=>setAnswers(a=>({...a,[q.id]:opt}))}/>{opt}</label>)}
    </div>)}
    {error && <p className="notice">{error}</p>}
    <button className="btn" disabled={busy || questions.length===0}>{busy?'Submitting…':'Submit assessment'}</button>
  </form>;
}
