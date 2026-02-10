/**
 * Client-side hotel scoring for comparison.
 * Single utility: compute dataset stats once, normalize 0–1, weighted sum, rank, pick one suggested.
 * No ML, no external APIs, no user sliders.
 */

const WEIGHTS = {
  price: 0.35,
  rating: 0.3,
  distanceFromAirport: 0.2,
  reviews: 0.15,
}

/**
 * Safe numeric value for a hotel field (price, rating, distance, review count).
 * Uses distance as proxy for distanceFromAirport when missing.
 */
function num(hotel, key) {
  if (key === 'distanceFromAirport') {
    const v = hotel.distanceFromAirport ?? hotel.distance
    return v != null && !Number.isNaN(Number(v)) ? Number(v) : 0
  }
  if (key === 'reviews') {
    const v = hotel.reviewCount ?? hotel.reviews ?? 0
    return Math.max(0, Number(v) || 0)
  }
  const v = hotel[key]
  return v != null && !Number.isNaN(Number(v)) ? Number(v) : 0
}

/**
 * Compute min/max stats from the hotel list (once per comparison).
 */
function computeStats(hotels) {
  if (!hotels?.length) {
    return {
      minPrice: 0,
      maxPrice: 1,
      maxDistanceFromAirport: 1,
      maxReviewCount: 1,
    }
  }
  let minPrice = Infinity
  let maxPrice = -Infinity
  let maxDistanceFromAirport = 0
  let maxReviewCount = 0

  for (const h of hotels) {
    const p = num(h, 'price')
    if (p > 0) {
      minPrice = Math.min(minPrice, p)
      maxPrice = Math.max(maxPrice, p)
    }
    maxDistanceFromAirport = Math.max(maxDistanceFromAirport, num(h, 'distanceFromAirport'))
    maxReviewCount = Math.max(maxReviewCount, num(h, 'reviews'))
  }

  if (minPrice === Infinity) minPrice = 0
  if (maxPrice <= minPrice) maxPrice = minPrice + 1
  if (maxDistanceFromAirport === 0) maxDistanceFromAirport = 1
  if (maxReviewCount === 0) maxReviewCount = 1

  return {
    minPrice,
    maxPrice,
    maxDistanceFromAirport,
    maxReviewCount,
  }
}

/**
 * Normalize a single hotel into 0–1 components (higher = better for all after normalization).
 * Price and distance: lower raw value → higher normalized.
 */
function normalize(hotel, stats) {
  const priceRaw = num(hotel, 'price')
  const priceNorm =
    stats.maxPrice > stats.minPrice
      ? 1 - (priceRaw - stats.minPrice) / (stats.maxPrice - stats.minPrice)
      : 1

  const ratingRaw = num(hotel, 'rating')
  const ratingNorm = Math.min(1, Math.max(0, ratingRaw / 5))

  const distRaw = num(hotel, 'distanceFromAirport')
  const distanceNorm =
    stats.maxDistanceFromAirport > 0
      ? 1 - distRaw / stats.maxDistanceFromAirport
      : 1

  const reviewsRaw = num(hotel, 'reviews')
  const reviewsNorm =
    stats.maxReviewCount > 0 ? reviewsRaw / stats.maxReviewCount : 0

  return {
    priceNorm,
    ratingNorm,
    distanceNorm,
    reviewsNorm,
  }
}

/**
 * Score one hotel (weighted sum of normalized values).
 */
function scoreHotel(hotel, stats) {
  const n = normalize(hotel, stats)
  return (
    WEIGHTS.price * n.priceNorm +
    WEIGHTS.rating * n.ratingNorm +
    WEIGHTS.distanceFromAirport * n.distanceNorm +
    WEIGHTS.reviews * n.reviewsNorm
  )
}

/**
 * Score all hotels, sort by score descending, mark exactly one as suggested.
 * Returns { scoredAndSortedHotels, suggestedHotelId }.
 * suggestedHotelId is the id of the top-ranked hotel; only that hotel gets isSuggested: true.
 *
 * @param {Array<{ id: string, [key: string]: unknown }>} hotels
 * @returns {{ scoredAndSorted: Array<{ id: string, score: number, isSuggested: boolean, [key: string]: unknown }>, suggestedHotelId: string | null }}
 */
export function scoreAndSuggestHotels(hotels) {
  if (!hotels?.length) {
    return { scoredAndSorted: [], suggestedHotelId: null }
  }
  if (hotels.length === 1) {
    const one = { ...hotels[0], score: 1, isSuggested: true }
    return { scoredAndSorted: [one], suggestedHotelId: hotels[0].id }
  }

  const stats = computeStats(hotels)
  const withScores = hotels.map((h) => ({
    ...h,
    score: scoreHotel(h, stats),
  }))
  withScores.sort((a, b) => b.score - a.score)

  const suggestedId = withScores[0].id
  const scoredAndSorted = withScores.map((h) => ({
    ...h,
    isSuggested: h.id === suggestedId,
  }))

  return {
    scoredAndSorted,
    suggestedHotelId: suggestedId,
  }
}
