import '../styles/staticPages.css'

const SERVICES = [
  {
    title: 'Jewellery Cleaning',
    desc: 'Bring your pieces in for a complimentary clean and polish — keep them looking new for longer.',
  },
  {
    title: 'Repairs & Resizing',
    desc: 'Clasps, chains, and ring sizing — our in-house team handles most repairs while you wait.',
  },
  {
    title: 'Custom Orders',
    desc: 'Have a design in mind? Share your idea with us and we will work with you to bring it to life.',
  },
  {
    title: 'Gift Wrapping',
    desc: 'Every order can be wrapped in our signature packaging, ready to gift — just ask at checkout.',
  },
  {
    title: 'Personal Styling',
    desc: 'Visit us in-store and our team will help you put together pieces that suit your everyday look.',
  },
  {
    title: 'Corporate & Bulk Gifting',
    desc: 'Planning gifts for an event or your team? Reach out and we will put together a bulk order for you.',
  },
]

export default function Services() {
  return (
    <div className="static-page">
      <div className="page-header">
        <p className="eyebrow">Services</p>
        <h1>How we can help</h1>
        <p>Beyond our collections, here's what you can expect from us.</p>
      </div>

      <div className="container services-grid">
        {SERVICES.map((s) => (
          <div className="service-card" key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
