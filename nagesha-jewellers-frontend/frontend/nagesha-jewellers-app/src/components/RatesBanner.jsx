import { useEffect, useState } from 'react'
import api from '../services/api'

export default function RatesBanner() {
  const [rates, setRates] = useState(null) // null = loading, [] = loaded empty

  useEffect(() => {
    api.get('/rates')
      .then(res => {
        // res.data is already the array from your backend
        const data = Array.isArray(res.data) ? res.data : []
        setRates(data)
      })
      .catch((err) => {
        console.error('RatesBanner fetch failed:', err)
        setRates([]) // show nothing on error
      })
  }, [])

  // Still loading or genuinely empty
  if (!rates || rates.length === 0) return null

  const find = (type) => rates.find(r => r.metalType === type)
  const gold22k = find('Gold22k')
  const gold18k = find('Gold18k')
  const silver  = find('Silver')

  // If none matched, don't render
  if (!gold22k && !gold18k && !silver) return null

  const fmt = (val) =>
    `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/g`

  return (
    <div style={{
      background: '#2B231C',
      color: '#E2D9CC',
      padding: '0.6rem 1rem',
      fontSize: '0.82rem',
      letterSpacing: '0.03em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
      width: '100%',
    }}>
      <span style={{ color: '#B8935F', fontWeight: 600 }}>
        Today's Rates (per gram)
      </span>
      {gold22k && (
        <span>Gold 22k — <strong style={{ color: '#fff' }}>{fmt(gold22k.ratePerGram)}</strong></span>
      )}
      {gold18k && (
        <span>Gold 18k — <strong style={{ color: '#fff' }}>{fmt(gold18k.ratePerGram)}</strong></span>
      )}
      {silver && (
        <span>Silver — <strong style={{ color: '#fff' }}>{fmt(silver.ratePerGram)}</strong></span>
      )}
      <span style={{ fontSize: '0.72rem', color: '#6B6055' }}>
        Live market rates · updates hourly
      </span>
    </div>
  )
}