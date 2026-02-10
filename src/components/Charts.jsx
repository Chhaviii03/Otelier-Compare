import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

const INDIGO_MUTED = '#6366f1'
const INDIGO_LIGHT = '#818cf8'

export function PriceChart({ hotels }) {
  const data = hotels.map((h) => ({
    name: h.name?.slice(0, 12) + (h.name?.length > 12 ? '…' : ''),
    fullName: h.name,
    price: h.price ?? 0,
  }))

  if (data.length === 0) return null

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 8, bottom: 12 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
          <Bar dataKey="price" radius={[6, 6, 0, 0]} barSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? INDIGO_MUTED : INDIGO_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RatingChart({ hotels }) {
  const data = hotels.map((h) => ({
    name: h.name?.slice(0, 12) + (h.name?.length > 12 ? '…' : ''),
    fullName: h.name,
    rating: h.rating ?? 0,
  }))

  if (data.length === 0) return null

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 8, bottom: 12 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
          <Bar dataKey="rating" radius={[6, 6, 0, 0]} barSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? INDIGO_MUTED : INDIGO_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Distance from airport (km). Uses distance or distanceFromAirport. Lower is better. */
export function DistanceChart({ hotels }) {
  const data = hotels.map((h) => {
    const dist = h.distanceFromAirport ?? h.distance ?? 0
    const val = typeof dist === 'number' && !Number.isNaN(dist) ? dist : 0
    return {
      name: h.name?.slice(0, 12) + (h.name?.length > 12 ? '…' : ''),
      fullName: h.name,
      distance: val,
    }
  })

  if (data.length === 0) return null

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 8, bottom: 12 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
          <Bar dataKey="distance" radius={[6, 6, 0, 0]} barSize={28} name="km">
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? INDIGO_MUTED : INDIGO_LIGHT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
