export function deepClone (o) {
  return JSON.parse(JSON.stringify(o))
}

export function equalObj (o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2)
}