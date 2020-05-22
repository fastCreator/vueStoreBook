// 获取矩形SVG路径
export function getRectPath ({ paths, square, type }) {
  return `M${paths.reduce((a, b) => `${a} L${b[0]} ${b[1]}`, '').slice(2)} Z`
}

// 获取圆形SVG路径
export function getEllipsePath ({ paths, square, type }) {
  const p1 = paths[0]
  const p2 = paths[2]
  const cx = (p1[0] + p2[0]) / 2
  const cy = (p1[1] + p2[1]) / 2
  const rx = Math.abs(p1[0] - p2[0]) / 2
  const ry = Math.abs(p1[1] - p2[1]) / 2
  return { cx, cy, rx, ry }
}

// 矩形变正方形
export function sqre2rect (paths, i) {
  i = getHornN(i + 2)
  const v = paths[i]
  const { minX, minY, maxX, maxY, min, max, d } = getShapeInfo(paths)
  if (v[0] === minX && v[1] === minY) {
    return [
      [v[0], v[1]],
      [v[0] + d, v[1]],
      [v[0] + d, v[1] + d],
      [v[0], v[1] + d]
    ]
  }
  if (v[0] === minX && v[1] === maxY) {
    return [
      [v[0], v[1] - d],
      [v[0], v[1]],
      [v[0] + d, v[1]],
      [v[0] + d, v[1] - d]
    ]
  }
  if (v[0] === maxX && v[1] === maxY) {
    return [
      [v[0] - d, v[1] - d],
      [v[0] - d, v[1]],
      [v[0], v[1]],
      [v[0], v[1] - d]
    ]
  }

  return [
    [v[0] - d, v[1]],
    [v[0] - d, v[1] + d],
    [v[0], v[1] + d],
    [v[0], v[1]]
  ]
}

// 平移
export function moveDirec (paths, [mw, mh]) {
  return paths.map(it => [it[0] + mw, it[1] + mh])
}

export const DirecLenMap = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
}

// 矩形拖动对角
export function dragRactHorn (paths, j, { ex, ey }) {
  const preJ = getHornN(j - 1)
  const nextJ = getHornN(j + 1)
  const dJ = getHornN(j + 2)

  if (isOddHorn(paths, j)) {
    paths[preJ] = [ex, paths[dJ][1]]
    paths[j] = [ex, ey]
    paths[nextJ] = [paths[dJ][0], ey]
  } else {
    paths[preJ] = [paths[dJ][0], ey]
    paths[j] = [ex, ey]
    paths[nextJ] = [ex, paths[dJ][1]]
  }
  return paths
}

// 获取对应角的位置
export function getHornN (n, m = 4) {
  return (n + m) % m
}

// 一大一小为中间
export function isOddHorn (paths, j) {
  const { minX, minY, maxX, maxY } = getShapeInfo(paths)
  const block = paths[j]
  if (
    (block[0] === minX && block[1] === maxY) ||
    (block[0] === maxX && block[1] === minY)
  ) {
    return true
  }
}

// 获取图形信息
export function getShapeInfo (paths) {
  const arrX = paths.map(it => it[0])
  const arrY = paths.map(it => it[1])
  const minX = Math.min.apply(null, arrX)
  const minY = Math.min.apply(null, arrY)
  const maxX = Math.max.apply(null, arrX)
  const maxY = Math.max.apply(null, arrY)
  const min = Math.min(minX, minY)
  const max = Math.max(maxX, maxY)
  const w = maxX - minX
  const h = maxY - minY
  const d = Math.max(w, h)
  return { minX, minY, maxX, maxY, min, max, w, h, d }
}

export function deepClone (o) {
  return JSON.parse(JSON.stringify(o))
}
