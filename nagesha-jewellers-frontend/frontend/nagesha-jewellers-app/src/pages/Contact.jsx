import '../styles/staticPages.css'

// We use Google Maps' embed search feature, pointed at the shop's address
// text directly. This is more reliable than us guessing exact map
// coordinates - Google looks up the real location from the address text
// itself, the same way typing it into Google Maps would.
const SHOP_ADDRESS = 'Nagesha Jewellers, Opposite Ganapati Mandir, Main Road, Shirol, Tal. Shirol, Dist. Kolhapur, Maharashtra'
const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP_ADDRESS)}&output=embed`
const MAPS_DIRECTIONS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_ADDRESS)}`

export default function Contact() {
  return (
    <div className="static-page">
      <div className="page-header">
        <p className="eyebrow">Contact Us</p>
        <h1>Visit us, or say hello</h1>
        <p>We'd love to help in person, on email, or over the phone.</p>
      </div>

      <div className="container contact-layout">
        <div className="contact-details">
          <div className="contact-block">
            <h3>Visit Our Store</h3>
            <p>
              Nagesha Jewellers<br />
              Opposite Ganapati Mandir, Main Road<br />
              Shirol, Tal- Shirol<br />
              Dist- Kolhapur, Maharashtra
            </p>
            <a href={MAPS_DIRECTIONS_LINK} target="_blank" rel="noopener noreferrer" className="directions-link">
              Get Directions →
            </a>
          </div>

          <div className="contact-block">
            <h3>Store Hours</h3>
            <p>Monday – Saturday: 10:00 AM – 8:30 PM<br />Sunday: 10:00 AM – 7:00 PM</p>
          </div>

          <div className="contact-block">
            <h3>Get in Touch</h3>
            <p>
              Email: <a href="mailto:bandiwadekarprasanna@gmail.com">bandiwadekarprasanna@gmail.com</a><br />
              Phone: <a href="tel:+918421058477">+91 8421058477</a>
            </p>
          </div>
        </div>

        <div className="contact-map">
          <iframe
            title="Nagesha Jewellers location"
            src={MAPS_EMBED_SRC}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '420px', borderRadius: '4px' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}
