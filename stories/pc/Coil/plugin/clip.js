export default async function (imgUrl, blocks) {
  let urls = []
  for (let i = 0; i < blocks.length; i++) {
    let it = blocks[0]
    const ctx = await src2canvas(imgUrl)
    const rectbox = getRectbox(it.paths)
    if (it.type === 'ellipse') {

    } else {

    }
    const imgData = ctx.getImageData(rectbox.x, rectbox.y, rectbox.width, rectbox.height)
    const url = ImageDatetocanvas(imgData).toDataURL()
    urls.push(url)
  }
  return urls
}

function ImageDatetocanvas (imgData) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext('2d')
  canvas.width = imgData.width
  canvas.height = imgData.height
  ctx.putImageData(imgData, 0, 0);
  return canvas
}

function getRectbox (paths) {
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

function src2canvas (src) {
  return new Promise(reslove => {
    let img = new Image()
    img.src = src
    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      reslove(ctx)
    }
    img.onerror = function (e) {
      console.error(e)
    }
  })
}
