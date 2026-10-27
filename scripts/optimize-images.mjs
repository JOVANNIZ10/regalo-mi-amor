import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

// Configuracion: las imagenes se muestran como maximo a ~210px de tamano,
// 640px queda de sobra para pantallas retina (x2-x3).
const maxDim = 640
const quality = 82

const files = (await readdir('src/assets/images')).filter((f) =>
  /\.(png|jpe?g)$/i.test(f)
)

for (const file of files) {
  const input = path.join('src/assets/images', file)
  const meta = await sharp(input).metadata()
  const sizeKB = (await stat(input)).size / 1024

  const base = file.replace(/\.(png|jpe?g)$/i, '')
  const isPhoto = /\.jpe?g$/i.test(file)
  const outName = base + (isPhoto ? '.jpg' : '.webp')
  const output = path.join('src/assets/images', outName)

  /* ya esta optimizado (la salida tendria el mismo nombre que el original) */
  if (input === output) {
    console.log(`skip ${file} (ya optimizado)`)
    continue
  }

  let pipeline = sharp(input).resize({
    width: meta.width > meta.height ? maxDim : null,
    height: meta.height >= meta.width ? maxDim : null,
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (isPhoto) pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  else pipeline = pipeline.webp({ quality, effort: 6 })

  await pipeline.toFile(output)
  const outKB = (await stat(output)).size / 1024

  console.log(
    `${file} (${meta.width}x${meta.height}, ${sizeKB.toFixed(0)}KB) -> ${outName} (${outKB.toFixed(0)}KB)`
  )
}
