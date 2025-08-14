// /api/chat.js
import fs from 'fs/promises'; import path from 'path';

export default async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { character_id='alex', messages=[], profile=null } = body || {};
    const cwd = process.cwd();
    const [sys, chStr] = await Promise.all([
      fs.readFile(path.join(cwd,'aitor/prompts/system.common.txt'),'utf-8'),
      fs.readFile(path.join(cwd,'aitor/characters',`${character_id}.json`),'utf-8')
    ]);
    const ch = JSON.parse(chStr);
    const system = `${sys}\n\n[Character Style]\n${ch.tone_prompt}\nRules: ${(ch.style_rules||[]).join('; ')}`;

    const opening = profile ? `학생 프로필 요약: 이름=${profile.name||''}, 목표=${profile.target_score||''}, 남은기간=${profile.time_left||''}, 레벨=${profile.english_level||''}.` : '학생 프로필 없음.';
    const msgs = (messages[0]?.role==='system' && messages[0]?.content==='opening')
      ? [{role:'user', content:`${ch.name}로서 친근한 첫 인사 + ${opening} + 2문장으로 다음 질문 제시`}]
      : messages;

    const payload = { model: 'gpt-4o-mini', temperature: 0.4, messages: [{role:'system', content: system}, ...msgs] };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ ok:true, reply });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
}
