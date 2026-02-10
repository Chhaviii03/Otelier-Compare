import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed']

export function PriceChart({ hotels }) {
  const data = hotels.map((h) => ({
    name: h.name?.slice(0, 12) + (h.name?.length > 12 ? '…' : ''),
    fullName: h.name,
    price: h.price ?? 0,
  }))

  if (data.length === 0) return null

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Legend />
          <Bar dataKey="price" name="Price (€)" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
          <Legend />
          <Bar dataKey="rating" name="Rating" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
