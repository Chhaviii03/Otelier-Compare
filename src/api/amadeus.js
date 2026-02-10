import axios from 'axios'

const AMADEUS_BASE = 'https://test.api.amadeus.com'
const AMADEUS_TOKEN_URL = `${AMADEUS_BASE}/v1/security/oauth2/token`

const apiKey = import.meta.env.VITE_AMADEUS_KEY
const apiSecret = import.meta.env.VITE_AMADEUS_SECRET

let cachedToken = null
let tokenExpiry = 0

/**
 * Get OAuth2 access token for Amadeus API (grant_type=client_credentials).
 * Token is cached and reused until close to expiry.
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken
  }
  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API key or secret not configured')
  }
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: apiSecret,
  })
  const { data } = await axios.post(AMADEUS_TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in || 1799) * 1000
  return cachedToken
}

/**
 * Fetch hotel offers from Amadeus.
 * Uses Hotel List by city when offers-by-city is not available, then maps to a consistent shape.
 * GET /v2/shopping/hotel-offers style params: cityCode, adults, checkInDate, checkOutDate, page/offset.
 */
export async function fetchHotelOffers(params) {
  const {
    cityCode = 'PAR',
    adults = 1,
    checkInDate,
    checkOutDate,
    page = 1,
    pageSize = 10,
  } = params || {}

  const token = await getAccessToken()

  // Amadeus Hotel List returns hotels in a city; we use it and normalize to "offers" shape.
  // For production you would use the exact Amadeus endpoint that returns offers (e.g. by hotelIds).
  const listUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`
  const listParams = {
    cityCode: cityCode.toUpperCase(),
    radius: 5,
    radiusUnit: 'KM',
  }

  let hotels = []
  try {
    const listRes = await axios.get(listUrl, {
      params: listParams,
      headers: { Authorization: `Bearer ${token}` },
    })
    const raw = listRes.data?.data || []
    hotels = raw.map((h, i) => ({
      id: h.hotelId || h.iataCode || `hotel-${i}`,
      name: h.name || 'Hotel',
      hotelId: h.hotelId || h.iataCode,
      address: h.address?.lines?.join(', ') || '',
      distance: h.distance ? Number(h.distance) : null,
      rating: null,
      price: null,
      checkInDate: checkInDate || undefined,
      checkOutDate: checkOutDate || undefined,
    }))
  } catch (err) {
    if (err.response?.status === 401) {
      cachedToken = null
      throw new Error('Amadeus authentication failed')
    }
    if (err.response?.status >= 400) {
      throw new Error(err.response?.data?.errors?.[0]?.detail || 'Hotel search failed')
    }
    throw err
  }

  // Paginate in memory (API may not support offset for this endpoint)
  const offset = (page - 1) * pageSize
  const paginated = hotels.slice(offset, offset + pageSize)

  // If we have check-in/out and hotel IDs, try to fetch offers for first few (sample prices)
  const hasDates = checkInDate && checkOutDate
  if (hasDates && paginated.length > 0 && token) {
    try {
      const offersUrl = `${AMADEUS_BASE}/v2/shopping/hotel-offers`
      const hotelIds = paginated.slice(0, 5).map((h) => h.hotelId).filter(Boolean)
      if (hotelIds.length > 0) {
        const offersRes = await axios.get(offersUrl, {
          params: {
            hotelIds: hotelIds.join(','),
            adults: Math.min(adults, 9),
            checkInDate,
            checkOutDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
        const offers = offersRes.data?.data || []
        offers.forEach((o) => {
          const hotel = paginated.find((h) => h.hotelId === o.hotel?.hotelId)
          if (hotel) {
            const total = o.offers?.[0]?.total
            hotel.price = total ? Number(total) : null
            hotel.rating = o.offers?.[0]?.room?.description?.rating || null
          }
        })
      }
    } catch (_) {
      // Non-fatal: keep list without prices
    }
  }

  // Fill mock price/rating for demo when API doesn't return them
  paginated.forEach((h, i) => {
    if (h.price == null) h.price = 80 + (i % 5) * 40
    if (h.rating == null) h.rating = 3.5 + (i % 5) * 0.3
  })

  const hasMore = offset + paginated.length < hotels.length
  return {
    data: paginated,
    nextPage: hasMore ? page + 1 : null,
    total: hotels.length,
  }
}
