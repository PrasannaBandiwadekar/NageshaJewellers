// A reusable star rating component used in two ways:
//   1. Display mode (interactive=false): just shows coloured stars (on review cards)
//   2. Interactive mode (interactive=true): clickable stars for submitting a rating
export default function StarRating({
  rating = 0,
  max = 5,
  interactive = false,
  onRate,
  size = 18
}) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          style={{
            fontSize: size,
            color: star <= rating ? '#B8935F' : '#D6C9B4',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color 0.15s ease',
            lineHeight: 1,
          }}
          title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}
