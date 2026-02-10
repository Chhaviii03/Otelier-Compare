import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'hotel-compare-selection'
const MAX_COMPARE = 5

const CompareContext = createContext(null)

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (_) {
    // ignore
  }
}

export function CompareProvider({ children }) {
  const [selected, setSelected] = useState(loadFromStorage)

  useEffect(() => {
    saveToStorage(selected)
  }, [selected])

  const addHotel = useCallback((hotel) => {
    if (!hotel?.id) return
    setSelected((prev) => {
      if (prev.some((h) => h.id === hotel.id)) return prev
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, hotel]
    })
  }, [])

  const removeHotel = useCallback((id) => {
    setSelected((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const toggleHotel = useCallback((hotel) => {
    if (!hotel?.id) return
    setSelected((prev) => {
      const exists = prev.some((h) => h.id === hotel.id)
      if (exists) return prev.filter((h) => h.id !== hotel.id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, hotel]
    })
  }, [])

  const clearAll = useCallback(() => setSelected([]), [])

  const isSelected = useCallback(
    (id) => selected.some((h) => h.id === id),
    [selected]
  )

  const value = {
    selected,
    addHotel,
    removeHotel,
    toggleHotel,
    clearAll,
    isSelected,
    canCompare: selected.length >= 2,
    maxCompare: MAX_COMPARE,
  }

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
