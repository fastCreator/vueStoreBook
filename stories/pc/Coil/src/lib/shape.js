// 获取矩形SVG路径
export function getRectPath ({ paths, square, type }) {
  if (type === 'polygon') {
    return `M${paths.reduce((a, b) => `${a} L${b[0]} ${b[1]}`, '').slice(2)}`
  } else {
    return `M${paths.reduce((a, b) => `${a} L${b[0]} ${b[1]}`, '').slice(2)} Z`
  }
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
const edg = Math.PI / 180
// 矩形拖动对角
export function dragRactHornRotate (paths, j, { ex, ey }, rotate) {
  const rect = moveHornEven({ ...paths2rect(paths), rotate }, j, { cx: ex, cy: ey })
  return rect2paths(rect)
}
// 矩形拖动对角
export function dragRactHorn (paths, j, { ex, ey }) {
  const preJ = getHornN(j - 1)
  const nextJ = getHornN(j + 1)
  const dJ = getHornN(j + 2)
  const dx = paths[dJ][0]
  const dy = paths[dJ][1]
  if (isOddHorn(paths, j)) {
    paths[preJ] = [ex, dy]
    paths[j] = [ex, ey]
    paths[nextJ] = [dx, ey]
  } else {
    paths[preJ] = [dx, ey]
    paths[j] = [ex, ey]
    paths[nextJ] = [ex, dy]
  }
  return paths
}

export function paths2rect (paths) {
  const x = paths[0][0]
  const y = paths[0][1]
  return {
    width: paths[3][0] - x,
    height: paths[1][1] - y,
    x,
    y
  }
}

export function rect2paths ({ width, height, x, y }) {
  return [[x, y], [x, y + height], [x + width, y + height], [x + width, y]]
}

export function moveHornEven ({ width, height, x, y, rotate }, i, { cx, cy }) {
  let dI = (i + 4) % 8
  let [dx, dy] = getHornPath({ width, height, x, y })[dI] // 得到对角的坐标
  let [ex, ey] = getRotateXY({ x: dx, y: dy, ox: x + width / 2, oy: y + height / 2, rotate }) // 得到旋转后的坐标
  return getRactByPosRoate([ex, ey], [cx, cy], rotate)
}

// 已知两对角点和旋转角度，获取旋转前rect
export function getRactByPosRoate ([x1, y1], [x2, y2], rotate) {
  const [ox, oy] = [(x1 + x2) / 2, (y1 + y2) / 2]
  let [ex1, ey1] = getRotateXY({ x: x1, y: y1, ox, oy, rotate: -rotate }) // 获取旋转前坐标1
  let [ex2, ey2] = getRotateXY({ x: x2, y: y2, ox, oy, rotate: -rotate }) // 获取旋转前坐标2
  return {
    x: Math.min(ex1, ex2),
    y: Math.min(ey1, ey2),
    width: Math.abs(ex1 - ex2),
    height: Math.abs(ey1 - ey2),
  }
}

// 一个点绕任意点旋转θ度后的点的坐标
export function getRotateXY ({ x, y, ox, oy, rotate }) {
  const COS = Math.cos(rotate * edg)
  const SIN = Math.sin(rotate * edg)
  const dx = x - ox
  const dy = y - oy
  return [dx * COS - dy * SIN + ox, dx * SIN + dy * COS + oy]
}

// 获取8角标坐标
export function getHornPath ({ width, height, x, y }, HornWidth = 0) {
  let hwd2 = HornWidth / 2
  let wd2 = width / 2
  let hd2 = height / 2
  let arr = [[x, y], [x, y + hd2], [x, y + height], [x + wd2, y + height], [x + width, y + height], [x + width, y + hd2], [x + width, y], [x + wd2, y]]
  return arr.map(([x, y]) => [x - hwd2, y - hwd2])
}


// 矩形拖动对角-保持宽高比
export function dragRactHornRate (paths, j, { wDh, mx, my, px, py }) {
  const dJ = getHornN(j + 2)
  const dx = paths[dJ][0]
  const dy = paths[dJ][1]
  let ex = mx + px
  let ey = my + py
  const w = ex - dx
  const h = ey - dy
  const q = w * h > 0 ? 1 : -1
  if (wDh > 1) { // 按X轴拉
    ey = dy + w / wDh * q
  } else { // 按Y轴拉
    ex = dx + h * wDh * q
  }
  return dragRactHorn(paths, j, { ex, ey })
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

