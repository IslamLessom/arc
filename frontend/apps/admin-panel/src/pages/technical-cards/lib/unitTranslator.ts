/**
 * Translates English unit names to Russian abbreviations
 */
export const translateUnit = (unit?: string): string => {
  if (!unit) return 'г'

  const unitMap: Record<string, string> = {
    gram: 'г',
    grams: 'г',
    kilogram: 'кг',
    kilograms: 'кг',
    liter: 'л',
    liters: 'л',
    piece: 'шт',
    pieces: 'шт',
    milliliter: 'мл',
    milliliters: 'мл',
    г: 'г',
    кг: 'кг',
    л: 'л',
    шт: 'шт',
    мл: 'мл'
  }

  const lowerUnit = unit.toLowerCase().trim()
  return unitMap[lowerUnit] || unit
}
