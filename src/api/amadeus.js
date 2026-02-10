import axios from 'axios'

const AMADEUS_BASE = 'https://test.api.amadeus.com'
const AMADEUS_TOKEN_URL = `${AMADEUS_BASE}/v1/security/oauth2/token`

const apiKey = import.meta.env.VITE_AMADEUS_KEY
const apiSecret = import.meta.env.VITE_AMADEUS_SECRET

/**
 * Capital city per country for fallback when requested city has no hotels.
 * Static map only — no geolocation or distance APIs.
 * @type {Record<string, { city: string, iataCode: string }>}
 */
const countryCapitalMap = {
  India: { city: 'New Delhi', iataCode: 'DEL' },
  France: { city: 'Paris', iataCode: 'PAR' },
  Japan: { city: 'Tokyo', iataCode: 'TYO' },
}

/**
 * City name → IATA code for primary search (requested city).
 * Used to attempt Amadeus by-city before falling back to capital.
 */
const cityToIata = {
  Patna: 'PAT',
  'New Delhi': 'DEL',
  Paris: 'PAR',
  Tokyo: 'TYO',
  Kolkata: 'CCU',
  Mumbai: 'BOM',
  Gaya: 'GAY',
  Varanasi: 'VNS',
}

/**
 * Maps cities with limited/no Amadeus coverage to a nearby supported city (IATA).
 * O(1) lookup; deterministic and curated (e.g. Kolkata as hub for Patna).
 * @type {Record<string, { city: string, iata: string }>}
 */
const fallbackCityMap = {
  'Patna': { city: 'Kolkata', iata: 'CCU' },
  'Patna, India': { city: 'Kolkata', iata: 'CCU' },
  'Gaya': { city: 'Varanasi', iata: 'VNS' },
  'Gaya, India': { city: 'Varanasi', iata: 'VNS' },
}

/**
 * @param {string} [locationName] - User's location name (e.g. from Nominatim)
 * @returns {{ city: string, iata: string } | null}
 */
function getFallbackForLocation(locationName) {
  if (!locationName || typeof locationName !== 'string') return null
  const trimmed = locationName.trim()
  const cityPart = trimmed.split(',')[0].trim()
  return fallbackCityMap[trimmed] ?? fallbackCityMap[cityPart] ?? null
}

/**
 * Map Amadeus raw list response to our hotel shape.
 * @param {Array} raw - data from locations/hotels API
 * @param {{ checkInDate?: string, checkOutDate?: string }} opts
 * @returns {Array<{ id: string, name: string, hotelId: string, address: string, distance: number|null, rating: unknown, price: unknown, checkInDate?: string, checkOutDate?: string }>}
 */
function mapRawToHotels(raw, opts = {}) {
  const list = Array.isArray(raw) ? raw : []
  return list.map((h, i) => ({
    id: h.hotelId || h.iataCode || `hotel-${i}`,
    name: h.name || 'Hotel',
    hotelId: h.hotelId || h.iataCode,
    address: (h.address?.lines && h.address.lines.join(', ')) || '',
    distance: h.distance != null ? Number(h.distance) : null,
    rating: null,
    price: null,
    checkInDate: opts.checkInDate,
    checkOutDate: opts.checkOutDate,
  }))
}

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
 * @typedef {Object} HotelSearchResponse
 * @property {Array<{ id: string, name: string, hotelId: string, address: string, distance: number|null, rating: unknown, price: unknown }>} data
 * @property {number | null} nextPage
 * @property {number} total
 * @property {boolean} [isFallback] - true when results are from a mapped nearby city
 * @property {string} [bannerMessage] - message to show when isFallback is true
 * @property {string} [fallbackCityName] - name of the fallback city (e.g. "Kolkata")
 */

/**
 * Fetch hotel offers from Amadeus.
 * Supports both location-based (latitude/longitude, radius) and city-code search.
 * When primary search returns 0 results or errors, uses fallbackCityMap for a nearby supported city (e.g. Patna → Kolkata).
 * @param {Object} params
 * @returns {Promise<HotelSearchResponse>}
 */
export async function fetchHotelOffers(params) {
  const {
    location,
    cityCode = 'PAR',
    adults = 1,
    checkInDate,
    checkOutDate,
    page = 1,
    pageSize = 10,
  } = params || {}

  const token = await getAccessToken()
  const radius = 5
  const radiusUnit = 'KM'

  let listUrl
  let listParams

  if (location?.latitude != null && location?.longitude != null) {
    listUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-geocode`
    listParams = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      radiusUnit,
    }
  } else {
    listUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`
    listParams = {
      cityCode: (typeof cityCode === 'string' ? cityCode : 'PAR').toUpperCase(),
      radius,
      radiusUnit,
    }
  }

  let hotels = []
  let isFallback = false
  let fallbackCityName = null

  try {
    const listRes = await axios.get(listUrl, {
      params: listParams,
      headers: { Authorization: `Bearer ${token}` },
    })
    const raw = listRes.data?.data || []
    hotels = mapRawToHotels(raw, { checkInDate, checkOutDate })
  } catch (err) {
    if (err.response?.status === 401) {
      cachedToken = null
      throw new Error('Amadeus authentication failed')
    }
    if (err.response?.status === 404 || err.response?.status >= 400) {
      if (location?.latitude != null && listUrl?.includes('by-geocode')) {
        const fallback = getFallbackForLocation(location?.name)
        if (fallback) {
          try {
            const fallbackRes = await axios.get(`${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`, {
              params: { cityCode: fallback.iata, radius, radiusUnit },
              headers: { Authorization: `Bearer ${token}` },
            })
            hotels = mapRawToHotels(fallbackRes.data?.data || [], { checkInDate, checkOutDate })
            isFallback = true
            fallbackCityName = fallback.city
          } catch (_) {
            throw new Error(err.response?.data?.errors?.[0]?.detail || 'Hotel search failed')
          }
        } else {
          try {
            listUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`
            listParams = { cityCode: 'PAR', radius, radiusUnit }
            const fallbackRes = await axios.get(listUrl, {
              params: listParams,
              headers: { Authorization: `Bearer ${token}` },
            })
            hotels = mapRawToHotels(fallbackRes.data?.data || [], { checkInDate, checkOutDate })
          } catch (_) {
            throw new Error(err.response?.data?.errors?.[0]?.detail || 'Hotel search failed')
          }
        }
      } else {
        throw new Error(err.response?.data?.errors?.[0]?.detail || 'Hotel search failed')
      }
    } else {
      throw err
    }
  }

  // Smart fallback: primary returned 0 results — try mapped nearby city
  if (hotels.length === 0 && location?.name) {
    const fallback = getFallbackForLocation(location.name)
    if (fallback) {
      try {
        const fallbackRes = await axios.get(`${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`, {
          params: { cityCode: fallback.iata, radius, radiusUnit },
          headers: { Authorization: `Bearer ${token}` },
        })
        hotels = mapRawToHotels(fallbackRes.data?.data || [], { checkInDate, checkOutDate })
        isFallback = true
        fallbackCityName = fallback.city
      } catch (_) {
        // keep hotels = []
      }
    }
  }

  const offset = (page - 1) * pageSize
  const paginated = hotels.slice(offset, offset + pageSize)

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

  paginated.forEach((h, i) => {
    if (h.price == null) h.price = 80 + (i % 5) * 40
    if (h.rating == null) h.rating = 3.5 + (i % 5) * 0.3
  })

  const hasMore = offset + paginated.length < hotels.length
  /** @type {HotelSearchResponse} */
  const result = {
    data: paginated,
    nextPage: hasMore ? page + 1 : null,
    total: hotels.length,
  }
  if (isFallback && fallbackCityName) {
    result.isFallback = true
    result.bannerMessage = '⚠️ Limited availability for this city. Showing popular / recommended stays nearby.'
    result.fallbackCityName = fallbackCityName
  }
  return result
}

// --- Capital-city fallback (searchHotels) ---

/**
 * Fetch hotel list from Amadeus by city IATA code. Used by searchHotels.
 * @param {string} cityCode - IATA city code (e.g. DEL, PAR)
 * @param {{ checkInDate?: string, checkOutDate?: string, adults?: number }} [opts]
 * @returns {Promise<Array<{ id: string, name: string, hotelId: string, address: string, price: unknown, rating: unknown, city?: string, isFallback?: boolean }>>}
 */
async function fetchHotelsByCityCode(cityCode, opts = {}) {
  const token = await getAccessToken()
  const radius = 5
  const radiusUnit = 'KM'
  const { checkInDate, checkOutDate, adults = 1 } = opts

  const listUrl = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`
  const listRes = await axios.get(listUrl, {
    params: { cityCode: String(cityCode).toUpperCase(), radius, radiusUnit },
    headers: { Authorization: `Bearer ${token}` },
  })
  const raw = listRes.data?.data || []
  let hotels = mapRawToHotels(raw, { checkInDate, checkOutDate })

  const hasDates = checkInDate && checkOutDate
  if (hasDates && hotels.length > 0) {
    try {
      const offersUrl = `${AMADEUS_BASE}/v2/shopping/hotel-offers`
      const hotelIds = hotels.slice(0, 5).map((h) => h.hotelId).filter(Boolean)
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
          const hotel = hotels.find((h) => h.hotelId === o.hotel?.hotelId)
          if (hotel) {
            const total = o.offers?.[0]?.total
            hotel.price = total ? Number(total) : null
            hotel.rating = o.offers?.[0]?.room?.description?.rating || null
          }
        })
      }
    } catch (_) {}
  }
  hotels.forEach((h, i) => {
    if (h.price == null) h.price = 80 + (i % 5) * 40
    if (h.rating == null) h.rating = 3.5 + (i % 5) * 0.3
  })
  return hotels
}

/**
 * Search hotels by city and country with capital-city fallback.
 * 1) Attempt Amadeus for the requested city (if IATA known).
 * 2) If no hotels, fetch capital of country from static map and return those with isFallback.
 * 3) If country not in map, return empty with error.
 *
 * @param {string} city - Requested city name (e.g. "Patna")
 * @param {string} country - Country name (e.g. "India")
 * @param {{ checkInDate?: string, checkOutDate?: string, adults?: number }} [opts]
 * @returns {Promise<{ hotels: Array<{ name: string, price: string|number, city?: string, isFallback?: boolean, id?: string, address?: string, rating?: unknown }>, isFallback?: boolean, fallbackType?: string, fallbackCity?: string, bannerMessage?: string, error?: string }>}
 */
export async function searchHotels(city, country, opts = {}) {
  const cityNorm = typeof city === 'string' ? city.trim() : ''
  const countryNorm = typeof country === 'string' ? country.trim() : ''

  // 1) Primary: attempt requested city (if we have IATA)
  const cityIata = cityNorm ? (cityToIata[cityNorm] || cityToIata[cityNorm.split(',')[0].trim()]) : null
  if (cityIata) {
    try {
      const list = await fetchHotelsByCityCode(cityIata, opts)
      if (list.length > 0) {
        const hotels = list.map((h) => ({
          ...h,
          name: h.name || '',
          price: h.price != null ? String(h.price) : '',
          city: cityNorm,
          isFallback: false,
        }))
        return { hotels, isFallback: false }
      }
    } catch (_) {
      // Fall through to capital fallback
    }
  }

  // 2) Fallback: capital of country (static map only)
  const capital = countryNorm ? countryCapitalMap[countryNorm] : null
  if (!capital) {
    return {
      hotels: [],
      error: 'No capital fallback for this country. Try another city or country.',
      isFallback: false,
    }
  }

  try {
    const list = await fetchHotelsByCityCode(capital.iataCode, opts)
    const hotels = list.map((h) => ({
      ...h,
      name: h.name || '',
      price: h.price != null ? String(h.price) : '',
      city: capital.city,
      isFallback: true,
    }))
    return {
      hotels,
      isFallback: true,
      fallbackType: 'capital',
      fallbackCity: capital.city,
      bannerMessage: '⚠️ Limited availability for this city. Showing popular stays in the capital.',
    }
  } catch (e) {
    return {
      hotels: [],
      error: e?.message || 'Failed to load hotels for the capital.',
      isFallback: false,
    }
  }
}
