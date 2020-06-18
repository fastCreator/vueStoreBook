export default async function (imgUrl, blocks) {
  let urls = []
  for (let i = 0; i < blocks.length; i++) {
    let it = blocks[i]
    const ctx = await src2canvas(imgUrl, it)
    const rectbox = getRectbox(it.paths, it.rotate)
    const imgData = ctx.getImageData(rectbox.x, rectbox.y, rectbox.width, rectbox.height)
    const url = ImageDatetocanvas(imgData).toDataURL()
    urls.push(url)
  }
  return urls
}
const edg = Math.PI / 180
function ImageDatetocanvas (imgData) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext('2d')
  canvas.width = imgData.width
  canvas.height = imgData.height
  ctx.putImageData(imgData, 0, 0);
  return canvas
}

function getRectbox (paths, rotate) {
  if (rotate) {
    const minX = paths[0][0]
    const maxX = paths[3][0]
    const minY = paths[0][1]
    const maxY = paths[1][1]
    const ox = (minX + maxX) / 2
    const oy = (minY + maxY) / 2
    paths = paths.map(([x, y]) => {
      const end = getRotateXY({ x, y, ox, oy, rotate })
      return [end[0], end[1]]
    })
  }
  const arrX = paths.map(it => it[0])
  const arrY = paths.map(it => it[1])
  const minX = Math.min.apply(null, arrX)
  const minY = Math.min.apply(null, arrY)
  const maxX = Math.max.apply(null, arrX)
  const maxY = Math.max.apply(null, arrY)
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
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

function src2canvas (src, block) {
  return new Promise(reslove => {
    let img = new Image()
    img.src = src
    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      // 旋转
      if (block.type === 'ellipse' || block.type === 'rect') {
        const paths = block.paths
        const minX = paths[0][0]
        const maxX = paths[3][0]
        const minY = paths[0][1]
        const maxY = paths[1][1]
        const cx = (minX + maxX) / 2
        const cy = (minY + maxY) / 2
        const width = maxX - minX
        const height = maxY - minY
        ctx.translate(cx, cy)
        ctx.rotate(block.rotate * Math.PI / 180)
        // 获取剪切路劲
        if (block.type === 'ellipse') {
          ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, 2 * Math.PI);
        } else {
          ctx.rect(-width / 2, -height / 2, width, height);
        }
        ctx.rotate(-block.rotate * Math.PI / 180)
        ctx.translate(-cx, -cy)
      } else {
        ctx.beginPath();
        block.paths.forEach((path, i) => {
          if (i === 0) {
            ctx.moveTo(path[0], path[1]);
          } else {
            ctx.lineTo(path[0], path[1]);
          }
        })
        ctx.closePath()
      }
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      document.body.appendChild(canvas)
      reslove(ctx)
    }
    img.onerror = function (e) {
      console.error(e)
    }
  })
}
