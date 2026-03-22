import { useState, useEffect } from 'react'

const TOP_CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'TRY', 'KRW', 'THB', 'AUD', 'CAD']

// Берётся из переменной окружения VITE_API_URL (задаётся в настройках Таймвеба)
const DEFAULT_API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API)
  const [currencies, setCurrencies] = useState({})
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [amount, setAmount] = useState(100)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOk, setBackendOk] = useState(null)

  const api = apiUrl.replace(/\/+$/, '')

  // Load currencies
  useEffect(() => {
    loadCurrencies()
  }, [apiUrl])

  async function loadCurrencies() {
    try {
      const resp = await fetch(`${api}/currencies`)
      if (!resp.ok) throw new Error()
      const data = await resp.json()
      setCurrencies(data)
      setBackendOk(true)
      setError('')
    } catch {
      setBackendOk(false)
      // Fallback: load from Frankfurter directly
      try {
        const resp = await fetch('https://api.frankfurter.dev/v1/currencies')
        const data = await resp.json()
        setCurrencies(data)
      } catch { }
    }
  }

  async function convert() {
    if (!amount || amount <= 0) { setError('Введи корректную сумму'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const resp = await fetch(`${api}/convert?amount=${amount}&from=${from}&to=${to}`)
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${resp.status}`)
      }
      const data = await resp.json()
      setResult(data)
      setBackendOk(true)
    } catch (e) {
      setError(`Ошибка: ${e.message}`)
      setBackendOk(false)
    } finally {
      setLoading(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setResult(null)
  }

  // Sort currencies: top first, then alphabetical
  const sortedCurrencies = Object.entries(currencies).sort((a, b) => {
    const ai = TOP_CURRENCIES.indexOf(a[0])
    const bi = TOP_CURRENCIES.indexOf(b[0])
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a[0].localeCompare(b[0])
  })

  return (
    <div style={styles.body}>
      <div style={styles.app}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>💱 Currency Converter</h1>
          <p style={styles.status}>
            <span style={{
              ...styles.dot,
              background: backendOk === null ? '#facc15' : backendOk ? '#34d399' : '#f87171',
              animation: backendOk ? 'pulse 2s infinite' : 'none',
            }} />
            {backendOk === null ? 'Подключаюсь...' : backendOk ? `Backend OK` : 'Backend недоступен'}
          </p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <div style={styles.topLine} />

          {/* Amount */}
          <label style={styles.label}>Сумма</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && convert()}
            style={styles.input}
            placeholder="0.00"
          />

          {/* Currency row */}
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Из</label>
              <select value={from} onChange={e => setFrom(e.target.value)} style={styles.select}>
                {sortedCurrencies.map(([code, name]) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
            </div>

            <button onClick={swap} style={styles.swapBtn} title="Поменять местами">⇅</button>

            <div style={styles.col}>
              <label style={styles.label}>В</label>
              <select value={to} onChange={e => setTo(e.target.value)} style={styles.select}>
                {sortedCurrencies.map(([code, name]) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Convert button */}
          <button
            onClick={convert}
            disabled={loading}
            style={{ ...styles.convertBtn, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Конвертирую...' : 'Конвертировать'}
          </button>

          {/* Result */}
          {result && (
            <div style={styles.result}>
              <div style={styles.resultAmount}>
                {result.result.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {result.to}
              </div>
              <div style={styles.resultRate}>1 {result.from} = {result.rate} {result.to}</div>
              <div style={styles.resultDate}>Курс на {result.date}</div>
            </div>
          )}

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* API URL config */}
        <div style={styles.config}>
          <label style={styles.configLabel}>Backend URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            style={styles.configInput}
            placeholder="http://your-server:8000"
          />
        </div>

        <div style={styles.footer}>
          Тест Python + Frontend на Таймвебе · FastAPI + Frankfurter API
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;500;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}

const styles = {
  body: {
    fontFamily: "'Outfit', sans-serif",
    background: '#0a0e17',
    color: '#e2e8f0',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundImage: 'radial-gradient(ellipse 600px 400px at 20% 10%, rgba(56,189,248,0.06), transparent), radial-gradient(ellipse 500px 500px at 80% 80%, rgba(52,211,153,0.04), transparent)',
  },
  app: { width: '100%', maxWidth: 460 },
  header: { textAlign: 'center', marginBottom: 32 },
  title: {
    fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #38bdf8, #34d399)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  status: { color: '#7a8baa', fontSize: '0.85rem', marginTop: 6, fontWeight: 300 },
  dot: {
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    marginRight: 5, verticalAlign: 'middle',
  },
  card: {
    background: '#111827', border: '1px solid #2a3550', borderRadius: 12,
    padding: '28px 24px', position: 'relative', overflow: 'hidden',
  },
  topLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg, #38bdf8, #34d399)',
  },
  label: {
    display: 'block', fontSize: '0.72rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: '#7a8baa', marginBottom: 8, marginTop: 14,
  },
  input: {
    width: '100%', background: '#1a2236', border: '1px solid #2a3550', borderRadius: 8,
    padding: '12px 14px', color: '#e2e8f0', fontFamily: "'DM Mono', monospace",
    fontSize: '1.05rem', outline: 'none',
  },
  select: {
    width: '100%', background: '#1a2236', border: '1px solid #2a3550', borderRadius: 8,
    padding: '12px 14px', color: '#e2e8f0', fontFamily: "'DM Mono', monospace",
    fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 42px 1fr', gap: 8, alignItems: 'end' },
  col: {},
  swapBtn: {
    width: 42, height: 42, borderRadius: '50%', background: '#1a2236',
    border: '1px solid #2a3550', color: '#38bdf8', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', marginBottom: 0, alignSelf: 'end',
  },
  convertBtn: {
    width: '100%', padding: 14, border: 'none', borderRadius: 8,
    background: 'linear-gradient(135deg, #38bdf8, #2563eb)', color: '#fff',
    fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 500,
    cursor: 'pointer', marginTop: 18,
  },
  result: {
    marginTop: 22, background: '#1a2236', borderRadius: 8, padding: 20, textAlign: 'center',
  },
  resultAmount: { fontFamily: "'DM Mono', monospace", fontSize: '2rem', fontWeight: 500, color: '#34d399' },
  resultRate: { fontSize: '0.8rem', color: '#7a8baa', marginTop: 8, fontFamily: "'DM Mono', monospace" },
  resultDate: { fontSize: '0.7rem', color: '#7a8baa', marginTop: 4, opacity: 0.7 },
  error: {
    marginTop: 14, padding: 12, background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171',
    fontSize: '0.85rem', textAlign: 'center',
  },
  config: { marginTop: 16, textAlign: 'center' },
  configLabel: {
    fontSize: '0.68rem', color: '#7a8baa', textTransform: 'uppercase',
    letterSpacing: '1px', display: 'block', marginBottom: 6,
  },
  configInput: {
    background: '#111827', border: '1px solid #2a3550', borderRadius: 6,
    padding: '8px 12px', color: '#7a8baa', fontFamily: "'DM Mono', monospace",
    fontSize: '0.75rem', width: '100%', textAlign: 'center', outline: 'none',
  },
  footer: { textAlign: 'center', marginTop: 20, fontSize: '0.7rem', color: '#7a8baa', opacity: 0.6 },
}
