'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Design tokens (match your site's CSS vars exactly) ───────────────────────
const T = {
  bg:      '#0A0A0C',
  bgE:     '#111114',
  bgC:     '#14141A',
  bgH:     '#1A1A22',
  srf:     '#0E0E12',
  txt:     '#D4D4D8',
  txtB:    '#F0F0F4',
  txtD:    '#6B6B78',
  txtG:    '#3A3A48',
  cy:      '#20E070',
  cyB:     'rgba(32,224,112,0.12)',
  cyD:     'rgba(32,224,112,0.07)',
  cyGl:   'rgba(32,224,112,0.15)',
  mg:     '#E040A0',
  mgD:    'rgba(224,64,160,0.06)',
  brd:    'rgba(255,255,255,0.04)',
  brdH:   'rgba(255,255,255,0.08)',
  r:      '12px',
  mono:   "'Space Mono', monospace",
  sans:   "'Outfit', -apple-system, sans-serif",
}

// ─── Steps config ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: 'projectType',
    q: 'What type of project is this?',
    hint: 'Select the closest match',
    options: [
      { label: 'Landing page',        value: 'Landing page & marketing site' },
      { label: 'SaaS / web app',      value: 'SaaS product or web app' },
      { label: 'E-commerce',          value: 'E-commerce store' },
      { label: 'Mobile app',          value: 'Mobile app design' },
      { label: 'Brand & design system', value: 'Brand identity & design system' },
      { label: 'AI / automation',     value: 'AI or automation workflow' },
    ],
  },
  {
    key: 'goal',
    q: "What's your main goal?",
    hint: 'Pick the outcome that matters most',
    options: [
      { label: 'Generate leads',        value: 'Generate leads and conversions' },
      { label: 'Launch MVP fast',       value: 'Launch an MVP quickly' },
      { label: 'Redesign existing',     value: 'Redesign an existing product' },
      { label: 'Improve UX & retention', value: 'Improve user experience and retention' },
      { label: 'Build brand trust',     value: 'Build brand authority and trust' },
      { label: 'Automate processes',    value: 'Automate internal processes' },
    ],
  },
  {
    key: 'timeline',
    q: "What's your timeline?",
    hint: 'Rough estimate is fine',
    options: [
      { label: 'ASAP — under 2 weeks', value: 'As soon as possible (under 2 weeks)' },
      { label: '1 month',              value: '1 month' },
      { label: '2–3 months',           value: '2–3 months' },
      { label: 'Flexible',             value: 'Flexible — quality over speed' },
    ],
  },
  {
    key: 'budget',
    q: "What's your approximate budget?",
    hint: 'Helps scope the right solution',
    options: [
      { label: 'Under $2k',  value: 'Under $2,000' },
      { label: '$2k – $5k',  value: '$2,000 – $5,000' },
      { label: '$5k – $15k', value: '$5,000 – $15,000' },
      { label: '$15k+',      value: '$15,000+' },
    ],
  },
  {
    key: 'challenge',
    q: "What's your biggest challenge?",
    hint: 'One sentence is enough — be specific',
    type: 'textarea',
  },
]

// ─── Inline styles (no Tailwind dependency, matches your CSS var system) ──────
const s = {
  section: {
    padding: '100px 0',
    position: 'relative',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 40px',
  },
  label: {
    fontFamily: T.mono,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: T.cy,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  labelLine: {
    display: 'inline-block',
    width: 28,
    height: 1,
    background: T.cy,
    opacity: 0.5,
  },
  heading: {
    fontFamily: T.sans,
    fontSize: 'clamp(36px, 4vw, 52px)',
    fontWeight: 700,
    color: T.txtB,
    lineHeight: 1.1,
    marginBottom: 12,
  },
  headingAccent: {
    color: T.cy,
  },
  subheading: {
    fontFamily: T.sans,
    fontSize: 15,
    color: T.txtD,
    lineHeight: 1.7,
    maxWidth: 480,
    marginBottom: 48,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    background: T.brd,
    border: `1px solid ${T.brd}`,
    borderRadius: T.r,
    overflow: 'hidden',
  },
  formSide: {
    background: T.bgE,
    padding: '48px 44px',
  },
  resultSide: {
    background: T.srf,
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
  },
  progressBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 36,
  },
  progressSeg: (state) => ({
    height: 2,
    flex: 1,
    background: state === 'done' ? T.cy : state === 'active' ? T.txtD : T.txtG,
    transition: 'background 0.3s',
    borderRadius: 1,
  }),
  stepQ: {
    fontFamily: T.sans,
    fontSize: 20,
    fontWeight: 600,
    color: T.txtB,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  stepHint: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.txtG,
    letterSpacing: '0.06em',
    marginBottom: 24,
  },
  optionGrid: (cols) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 8,
    marginBottom: 32,
  }),
  optionBtn: (selected) => ({
    padding: '12px 14px',
    border: `1px solid ${selected ? T.cy : T.brdH}`,
    background: selected ? T.cyD : 'transparent',
    fontFamily: T.sans,
    fontSize: 13,
    fontWeight: selected ? 500 : 400,
    color: selected ? T.cy : T.txt,
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 8,
    transition: 'all 0.15s',
    lineHeight: 1.3,
  }),
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${T.brdH}`,
    background: T.bgC,
    fontFamily: T.sans,
    fontSize: 13,
    fontWeight: 300,
    color: T.txt,
    borderRadius: 8,
    outline: 'none',
    resize: 'none',
    lineHeight: 1.6,
    marginBottom: 32,
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.txtG,
    letterSpacing: '0.06em',
  },
  btnNext: (disabled) => ({
    fontFamily: T.mono,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: disabled ? T.txtG : T.bg,
    background: disabled ? T.txtG : T.cy,
    padding: '11px 22px',
    border: 'none',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.15s',
  }),
  btnBack: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.txtG,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.06em',
    padding: 0,
  },
  resultLabel: {
    fontFamily: T.mono,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: T.txtG,
    marginBottom: 24,
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: T.sans,
    fontSize: 15,
    color: T.txtG,
    lineHeight: 1.6,
  },
  loader: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loaderText: {
    fontFamily: T.mono,
    fontSize: 12,
    color: T.cy,
    letterSpacing: '0.08em',
  },
  loaderSub: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.txtG,
    letterSpacing: '0.06em',
  },
  resultName: {
    fontFamily: T.sans,
    fontSize: 24,
    fontWeight: 700,
    color: T.txtB,
    marginBottom: 4,
  },
  resultType: {
    fontFamily: T.mono,
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.cy,
    marginBottom: 28,
  },
  block: {
    marginBottom: 22,
  },
  blockLabel: {
    fontFamily: T.mono,
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: T.txtG,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: `1px solid ${T.brd}`,
  },
  blockText: {
    fontFamily: T.sans,
    fontSize: 13,
    color: T.txt,
    lineHeight: 1.75,
  },
  phaseItem: {
    display: 'flex',
    gap: 12,
    marginBottom: 6,
    fontSize: 13,
    color: T.txt,
    fontFamily: T.sans,
  },
  phaseNum: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.cy,
    minWidth: 22,
    marginTop: 1,
  },
  resultFooter: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: `1px solid ${T.brd}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  footerNote: {
    fontFamily: T.sans,
    fontSize: 11,
    color: T.txtG,
    lineHeight: 1.5,
    maxWidth: 180,
  },
  btnCta: {
    fontFamily: T.mono,
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.bg,
    background: T.cy,
    padding: '10px 18px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
}

// ─── Spinner SVG ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
      style={{ animation: 'vm-spin 0.8s linear infinite' }}>
      <circle cx="14" cy="14" r="11" stroke={T.txtG} strokeWidth="1.5"/>
      <path d="M14 3a11 11 0 0 1 11 11" stroke={T.cy} strokeWidth="1.5" strokeLinecap="round"/>
      <style>{`@keyframes vm-spin { to { transform: rotate(360deg); transform-origin: 14px 14px; } }`}</style>
    </svg>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BriefGenerator() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase]     = useState('form')   // 'form' | 'loading' | 'result'
  const [brief, setBrief]     = useState(null)
  const [loadMsg, setLoadMsg] = useState('Analysing project type')
  const textRef = useRef(null)

  const loadingMessages = [
    'Analysing project type',
    'Scoping deliverables',
    'Defining project phases',
    'Preparing clarifying questions',
    'Finalising your brief',
  ]

  const currentStep = STEPS[step]
  const isOptionStep = !currentStep.type
  const selected = answers[currentStep.key]
  const canProceed = isOptionStep ? !!selected : true

  function selectOption(value) {
    setAnswers(prev => ({ ...prev, [currentStep.key]: value }))
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      generate()
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  async function generate() {
    const challenge = textRef.current?.value || 'Not specified'
    const finalAnswers = { ...answers, challenge }

    setPhase('loading')

    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length
      setLoadMsg(loadingMessages[msgIdx])
    }, 900)

    try {
      // ── OPTION A: Direct Claude API (dev/demo mode) ──────────────────────
      // Replace this block with Option B once your n8n workflow is live.
      const prompt = buildPrompt(finalAnswers)
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const raw = data.content[0].text.trim().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)
      clearInterval(interval)
      setBrief(parsed)
      setPhase('result')

      // ── OPTION B: n8n webhook (swap in when ready) ───────────────────────
      // const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(finalAnswers),
      // })
      // const parsed = await res.json()
      // clearInterval(interval)
      // setBrief(parsed)
      // setPhase('result')

    } catch (err) {
      clearInterval(interval)
      setBrief(fallbackBrief(finalAnswers))
      setPhase('result')
    }
  }

  function buildPrompt(a) {
    return `You are a senior creative studio director writing a project brief.

Based on these client answers, write a concise professional project brief in JSON format.

Client answers:
- Project type: ${a.projectType}
- Main goal: ${a.goal}
- Timeline: ${a.timeline}
- Budget: ${a.budget}
- Biggest challenge: ${a.challenge}

Return ONLY valid JSON (no markdown, no backticks):
{
  "projectName": "A short evocative name for this project (3-5 words)",
  "projectType": "${a.projectType}",
  "scope": "2-3 sentences describing what will be designed and built, specific to their inputs",
  "phases": ["Phase name: brief description", "Phase name: brief description", "Phase name: brief description", "Phase name: brief description"],
  "questions": "3 short clarifying questions before starting, separated by \\n"
}`
  }

  function fallbackBrief(a) {
    return {
      projectName: a.projectType?.includes('SaaS') ? 'The Dashboard Sprint'
        : a.projectType?.includes('Landing') ? 'Conversion-First Launch'
        : 'Studio Project Brief',
      projectType: a.projectType,
      scope: `Design and develop a ${a.projectType?.toLowerCase() || 'digital product'} focused on ${a.goal?.toLowerCase() || 'the client\'s core goal'}. Delivered within ${a.timeline?.toLowerCase() || 'the agreed timeline'} including UX, UI, and frontend build.`,
      phases: [
        'Discovery & research: Stakeholder interviews, user flows, competitive audit',
        'Design: Wireframes, hi-fi UI, interactive prototype in Figma',
        'Development: Frontend build in React/Next.js, responsive & accessible',
        'Launch & handoff: QA, documentation, deployment support',
      ],
      questions: 'Do you have existing brand guidelines or is visual identity in scope?\nWho is the primary decision-maker and what does approval look like?\nAre there existing tools or platforms this needs to integrate with?',
    }
  }

  function reset() {
    setStep(0)
    setAnswers({})
    setBrief(null)
    setPhase('form')
  }

  // Progress seg state
  function segState(i) {
    if (i < step) return 'done'
    if (i === step) return 'active'
    return 'idle'
  }

  return (
    <section style={s.section} id="ai_gen">
      <div style={s.inner}>

        {/* Header */}
        <div style={s.label}>
          <span style={s.labelLine} />
          // BRIEF_GENERATOR
        </div>
        <h2 style={s.heading}>
          Tell us what<br />
          you're <span style={s.headingAccent}>building.</span>
        </h2>
        <p style={s.subheading}>
          Answer five quick questions and get a structured project brief — scope, phases,
          and clarifying questions — generated instantly and tailored to your project.
        </p>

        {/* Tool card */}
        <div style={s.grid}>

          {/* ── Form side ── */}
          <div style={s.formSide}>
            <div style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 600, color: T.txtB, marginBottom: 4 }}>
              Project Brief
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.txtD, letterSpacing: '0.06em', marginBottom: 32 }}>
              Takes about 2 minutes
            </div>

            {/* Progress */}
            <div style={s.progressBar}>
              {STEPS.map((_, i) => (
                <div key={i} style={s.progressSeg(segState(i))} />
              ))}
            </div>

            {phase === 'form' && (
              <>
                <div style={s.stepQ}>{currentStep.q}</div>
                <div style={s.stepHint}>{currentStep.hint}</div>

                {/* Options */}
                {isOptionStep && (
                  <div style={s.optionGrid(currentStep.options.length > 4 ? 2 : 2)}>
                    {currentStep.options.map(opt => (
                      <button
                        key={opt.value}
                        style={s.optionBtn(selected === opt.value)}
                        onClick={() => selectOption(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Textarea */}
                {currentStep.type === 'textarea' && (
                  <textarea
                    ref={textRef}
                    style={s.textarea}
                    rows={4}
                    placeholder="e.g. We've tried building this before and it stalled. We need someone who can own it end to end..."
                  />
                )}

                {/* Nav */}
                <div style={s.navRow}>
                  {step > 0
                    ? <button style={s.btnBack} onClick={back}>← back</button>
                    : <span />
                  }
                  <span style={s.counter}>{step + 1} / {STEPS.length}</span>
                  <button
                    style={s.btnNext(!canProceed)}
                    disabled={!canProceed}
                    onClick={next}
                  >
                    {step === STEPS.length - 1 ? 'generate brief' : 'continue'} →
                  </button>
                </div>
              </>
            )}

            {phase !== 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {STEPS.map((st, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.cy, minWidth: 18, marginTop: 2 }}>✓</span>
                    <span style={{ fontFamily: T.sans, fontSize: 13, color: T.txtD }}>
                      <span style={{ color: T.txtG, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', marginRight: 6 }}>
                        {st.q.toUpperCase().substring(0, 20)}...
                      </span>
                      <br />
                      <span style={{ color: T.txt }}>
                        {answers[st.key] || (i === 4 ? textRef.current?.value : '') || '—'}
                      </span>
                    </span>
                  </div>
                ))}
                {phase === 'result' && (
                  <button
                    style={{ ...s.btnBack, marginTop: 16, color: T.cy, textDecoration: 'underline' }}
                    onClick={reset}
                  >
                    ↺ start over
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Result side ── */}
          <div style={s.resultSide}>
            <div style={s.resultLabel}>// YOUR_PROJECT_BRIEF</div>

            {/* Placeholder */}
            {phase === 'form' && (
              <div style={s.placeholder}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity={0.2}>
                  <rect x="6" y="4" width="28" height="32" rx="2" stroke={T.txt} strokeWidth="1"/>
                  <path d="M12 13h16M12 19h16M12 25h10" stroke={T.txt} strokeWidth="1" strokeLinecap="round"/>
                </svg>
                <div style={s.placeholderText}>
                  Your brief will<br />appear here
                </div>
              </div>
            )}

            {/* Loading */}
            {phase === 'loading' && (
              <div style={s.loader}>
                <Spinner />
                <div style={s.loaderText}>crafting your brief...</div>
                <div style={s.loaderSub}>{loadMsg}</div>
              </div>
            )}

            {/* Result */}
            {phase === 'result' && brief && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={s.resultName}>{brief.projectName}</div>
                <div style={s.resultType}>{brief.projectType}</div>

                <div style={s.block}>
                  <div style={s.blockLabel}>Scope overview</div>
                  <div style={s.blockText}>{brief.scope}</div>
                </div>

                <div style={s.block}>
                  <div style={s.blockLabel}>Suggested phases</div>
                  <div>
                    {brief.phases?.map((phase, i) => {
                      const [title, ...rest] = phase.split(':')
                      return (
                        <div key={i} style={s.phaseItem}>
                          <span style={s.phaseNum}>{String(i + 1).padStart(2, '0')}</span>
                          <span>
                            <strong style={{ color: T.txtB }}>{title.trim()}</strong>
                            {rest.length ? ': ' + rest.join(':').trim() : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={s.block}>
                  <div style={s.blockLabel}>Questions before we start</div>
                  <div>
                    {brief.questions?.split('\n').filter(q => q.trim()).map((q, i) => (
                      <div key={i} style={{
                        ...s.blockText,
                        marginBottom: 8,
                        paddingLeft: 12,
                        borderLeft: `2px solid ${T.cyD}`,
                      }}>
                        {q.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.resultFooter}>
                  <div style={s.footerNote}>
                    Brief generated by VM Studio AI. Ready to talk through the details?
                  </div>
                  <button
                    style={s.btnCta}
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    book a call →
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
