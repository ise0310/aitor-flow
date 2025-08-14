// /api/leveltest.js
export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const a = body?.answers || {};
    const correct = (a.r1==='B') + (a.r2==='A'); // sample key
    // Speaking: simple LLM scoring based on rubric-like instruction
    let speakScore = 0, speakFeedback = '';
    if (a.speak && a.speak.length > 0) {
      const payload = {
        model: 'gpt-4o-mini', temperature: 0.3,
        messages: [
          { role:'system', content: 'You are a TOEFL Speaking rater. Score 0-4 with brief strengths and issues. Output JSON: {"score":0-4,"strengths":[],"issues":[]}' },
          { role:'user', content: `Prompt: Do you prefer studying alone or with others?\nStudent answer: ${a.speak}` }
        ]
      };
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      try { 
        const j = JSON.parse(data?.choices?.[0]?.message?.content || '{}'); 
        speakScore = j.score || 0; speakFeedback = JSON.stringify(j);
      } catch { speakFeedback = data?.choices?.[0]?.message?.content || ''; }
    }
    res.status(200).json({
      reading: { correct },
      speaking: { score: speakScore, feedback: speakFeedback },
      weak_tags: [
        correct<2 ? 'R-inference' : null,
        (speakScore||0)<3.5 ? 'S-cohesion' : null
      ].filter(Boolean)
    });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
}
