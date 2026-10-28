import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import GlassButton from '../components/GlassButton'
import {
  KeyIcon,
  GiftIcon,
  LockIcon,
  UnlockIcon,
  CheckIcon,
  PaperIcon,
  BackpackIcon,
} from '../components/GiftObjects'
import {
  ISO_A,
  ISO_B,
  FURNITURE_SCALE,
  isoExtent,
  isoFrameFor,
  IsoArt,
  IsoBox,
} from '../components/IsoArt'
import patoEstera from '../assets/images/patoEstera.webp'
import patoChicoEnfadado from '../assets/images/patoChicoEnfadado.webp'
import patoChicoTriste from '../assets/images/patoChicoPoseTriste1.webp'
import patoChicoRescatado from '../assets/images/patoChicoPosecelebrando1.webp'
import villano from '../assets/images/villano.webp'
import patoEsteraEnfadado from '../assets/images/patoEsteraEnfadado.webp'
import regalosVillanoAudio1 from '../assets/audios/regalosVillanoAudio1.mp3'
import regalosVillanoAudio2 from '../assets/audios/regalosVillanoAudio2.mp3'
import regalosPatoChicoAudio1 from '../assets/audios/regalosPatoChicoAudio1.mp3'
import regalosPatoChicoAudio2 from '../assets/audios/regalosPatoChicoAudio2.mp3'
import regalosPatoChicaAudio1 from '../assets/audios/regalosPatoChicaAudio1.mp3'
import regalosPatoChicaAudio2 from '../assets/audios/regalosPatoChicaAudio2.mp3'
import regalo1 from '../assets/images/regalo1.webp'
import regalo2 from '../assets/images/regalo2.webp'
import regalo3 from '../assets/images/regalo3.webp'
import regalo4 from '../assets/images/regalo4.webp'
import { useDialogueAudio } from '../utils/useDialogueAudio'
import { playClickSfx, stopDialogAudios } from '../utils/audio'
import './Gifts.css'

/* ------------------------------------------------------------------
   Escena de entrada: el villano ha capturado al patito y la pata viene
   a rescatarlo. Cada linea tiene su personaje y su propio audio.
------------------------------------------------------------------ */
const DIALOGUES = [
  {
    image: villano,
    alt: 'Villano',
    name: 'Villano',
    text: 'Hahahaha, hahahaha, he conseguido capturarte, NADIE VA A RESCATARTE. ¿Tienes miedo criatura de mama?',
    audio: regalosVillanoAudio1,
  },
  {
    image: patoChicoEnfadado,
    alt: 'Patito enfadado',
    name: 'Patito',
    text: 'Ahhhh, saldre de aqui como sea y no te burles de mi, yo soy creatura de mi novia, seguro te dara para el pelo pedazo de calvo.',
    audio: regalosPatoChicoAudio1,
  },
  {
    image: patoEsteraEnfadado,
    alt: 'Pata enfadada',
    name: 'Pata',
    text: 'Como te atreves a capturar a mi amorcito, si no lo haces, mi furia caerá sobre ti. Amor, ahora te rescataré, estate tranquilo.',
    audio: regalosPatoChicaAudio1,
  },
  {
    image: patoChicoEnfadado,
    alt: 'Patito enfadado',
    name: 'Patito',
    text: 'Gracias mi amor. ¿Escuchaste grandullon? Segurio no te gustará probar la furia de mi novia, hazme caso, yo ya la he probado.',
    audio: regalosPatoChicoAudio2,
  },
  {
    image: villano,
    alt: 'Villano',
    name: 'Villano',
    text: 'esta bien, le daré una oportunidad, si es capaz de pasar la siguiente prueba de obstaculos te soltaré, si no, te haré picadillo. ¿Estas de acuerdo?',
    audio: regalosVillanoAudio2,
  },
  {
    image: patoEsteraEnfadado,
    alt: 'Pata enfadada',
    name: 'Pata',
    text: 'Vale, ya veras de lo que soy capaz. Amor mio, YA VOY.',
    audio: regalosPatoChicaAudio2,
  },
]

/* ------------------------------------------------------------------
   Instrucciones antes de empezar (se pasan con un toque).
------------------------------------------------------------------ */
const GUIDE = [
  'El juego consta de 4 niveles.',
  'En cada nivel tienes que encontrar la llave que te dejará abrir la puerta para pasar al siguiente nivel.',
  'Para encontrar la llave, tendrás que registrar los objetos o muebles de alrededor.',
]

/* ------------------------------------------------------------------
   Regalos (uno por nivel) y mapas del scaperoom.
   La vista es cenital: la pata se mueve por la sala, entra en las
   habitaciones, registra los objetos hasta encontrar la llave y su
   regalo, y luego sale por la puerta / verja. En el ultimo nivel no
   hay salida: hay que abrir la jaula del patito.
------------------------------------------------------------------ */
const GIFTS = [
  { name: 'Patito de peluche', image: regalo1 },
  { name: 'Pollito de peluche', image: regalo2 },
  { name: 'Perfume Valentino Vendetta', image: regalo3 },
  { name: 'Dyson Airwrap rosa', image: regalo4 },
]

/* Medidas del mundo de juego (en unidades de diseno) */
const PLAYER_R = 26
const SPEED = 340
const INTERACT = 185 /* distancia para que aparezca el aviso */
const AUTO_SPOT = 122 /* distancia a la que se registra al ir andando */
const AUTO_EXIT = 96
const AUTO_CAGE = 128
const STATION_STOP = 118

/* Proyeccion isometrica: cada nivel define el tamano de su mapa */
const WALL_HEIGHT = { house: 58, garden: 52, forest: 60, dungeon: 62 }

function makeView(map) {
  const offsetX = map.h * ISO_A
  const project = (x, y) => ({
    x: (x - y) * ISO_A + offsetX,
    y: (x + y) * ISO_B,
  })
  const unproject = (px, py) => {
    const u = (px - offsetX) / ISO_A
    const v = py / ISO_B
    return { x: (u + v) / 2, y: (v - u) / 2 }
  }
  return {
    project,
    unproject,
    width: (map.w + map.h) * ISO_A,
    height: (map.w + map.h) * ISO_B,
  }
}

const FLOOR_FILL = {
  house: '#6b4830',
  garden: '#3a6b3e',
  forest: '#2c5233',
  dungeon: '#4a4a55',
}

const WALL_COLORS = {
  house: { top: '#8a6a4a', left: '#5f4630', right: '#4a3524' },
  garden: { top: '#5a9a4e', left: '#2f5f30', right: '#244c28' },
  forest: { top: '#3d6b4a', left: '#1f422c', right: '#173322' },
  dungeon: { top: '#7a7a88', left: '#4a4a55', right: '#3a3a44' },
}

function floorQuad(project, rect) {
  return [
    project(rect.x, rect.y),
    project(rect.x + rect.w, rect.y),
    project(rect.x + rect.w, rect.y + rect.h),
    project(rect.x, rect.y + rect.h),
  ]
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
}

function centeredQuad(project, cx, cy, w, d, inset = 0) {
  return floorQuad(project, {
    x: cx - w / 2 + inset,
    y: cy - d / 2 + inset,
    w: w - inset * 2,
    h: d - inset * 2,
  })
}

const LEVELS = [
  /* ---------------------------------------------------------------- */
  {
    id: 'house',
    theme: 'house',
    name: 'La casa del villano',
    map: { w: 2000, h: 1250 },
    intro:
      'La casa del villano. La puerta principal está cerrada: necesitas la llave y tu regalo. La llave está en una caja fuerte; busca el papel con el código.',
    floor: { x: 106, y: 106, w: 1814, h: 1038 },
    rooms: [
      { x: 106, y: 106, w: 654, h: 484, tone: '#7a5233' },
      { x: 786, y: 106, w: 428, h: 484, tone: '#83603f' },
      { x: 1240, y: 106, w: 680, h: 484, tone: '#745038' },
      { x: 106, y: 616, w: 654, h: 528, tone: '#6b4830' },
      { x: 786, y: 616, w: 428, h: 528, tone: '#755136' },
      { x: 1240, y: 616, w: 680, h: 528, tone: '#6f4a31' },
    ],
    start: { x: 1000, y: 920 },
    walls: [
      { x: 80, y: 80, w: 1840, h: 26 },
      { x: 80, y: 80, w: 26, h: 1090 },
      { x: 1894, y: 80, w: 26, h: 1090 },
      { x: 80, y: 1144, w: 870, h: 26 },
      { x: 1070, y: 1144, w: 850, h: 26 },
      { x: 760, y: 106, w: 26, h: 194 },
      { x: 760, y: 400, w: 26, h: 190 },
      { x: 760, y: 616, w: 26, h: 184 },
      { x: 760, y: 900, w: 26, h: 270 },
      { x: 1214, y: 106, w: 26, h: 194 },
      { x: 1214, y: 400, w: 26, h: 190 },
      { x: 1214, y: 616, w: 26, h: 184 },
      { x: 1214, y: 900, w: 26, h: 270 },
      { x: 106, y: 590, w: 294, h: 26 },
      { x: 500, y: 590, w: 260, h: 26 },
      { x: 786, y: 590, w: 164, h: 26 },
      { x: 1050, y: 590, w: 164, h: 26 },
      { x: 1240, y: 590, w: 260, h: 26 },
      { x: 1600, y: 590, w: 320, h: 26 },
    ],
    labels: [],
    decor: [
      { art: 'rug', x: 350, y: 330, w: 280, d: 180 },
      { art: 'rug', x: 1000, y: 430, w: 240, d: 150 },
      { art: 'rug', x: 1630, y: 1010, w: 260, d: 160 },
    ],
    spots: [
      {
        id: 'sofa',
        art: 'sofa',
        label: 'Sofá',
        x: 250,
        y: 250,
        w: 210,
        content: 'gift',
      },
      {
        id: 'coffee',
        art: 'table',
        label: 'Mesa baja',
        x: 430,
        y: 400,
        w: 130,
        note: 'Revistas viejas y una taza fría.',
      },
      {
        id: 'plant',
        art: 'plant',
        label: 'Planta',
        x: 690,
        y: 200,
        w: 80,
        note: 'Tierra seca y una araña escondida al verte.',
      },
      {
        id: 'shelf1',
        art: 'shelf',
        label: 'Estantería',
        x: 190,
        y: 520,
        w: 150,
        note: 'Libros polvorientos. Ninguno esconde nada.',
      },
      {
        id: 'dining',
        art: 'table',
        label: 'Mesa del comedor',
        x: 1000,
        y: 330,
        w: 170,
        content: 'paper',
        code: '4821',
      },
      {
        id: 'shelf2',
        art: 'shelf',
        label: 'Aparador',
        x: 1130,
        y: 180,
        w: 140,
        note: 'Vajilla incompleta. Falta una taza.',
      },
      {
        id: 'fridge',
        art: 'fridge',
        label: 'Nevera',
        x: 1830,
        y: 200,
        w: 100,
        note: 'Un tarro de pepinillos y un yogur caducado.',
      },
      {
        id: 'stove',
        art: 'stove',
        label: 'Fogones',
        x: 1580,
        y: 200,
        w: 120,
        note: 'Una olla con algo que ya no se puede llamar comida.',
      },
      {
        id: 'pantry',
        art: 'wardrobe',
        label: 'Despensa',
        x: 1720,
        y: 480,
        w: 130,
        note: 'Latas y un saco de harina a medias.',
      },
      {
        id: 'bathtub',
        art: 'bathtub',
        label: 'Bañera',
        x: 280,
        y: 860,
        w: 220,
        note: 'Agua fría y un patito de goma que no es de los nuestros.',
      },
      {
        id: 'shelf3',
        art: 'shelf',
        label: 'Armario del baño',
        x: 200,
        y: 1060,
        w: 150,
        note: 'Toallas y un cepillo sin dueño.',
      },
      {
        id: 'safe',
        art: 'safe',
        label: 'Caja fuerte',
        x: 1330,
        y: 1040,
        w: 110,
        content: 'safe',
        code: '4821',
      },
      {
        id: 'bed',
        art: 'bed',
        label: 'Cama',
        x: 1620,
        y: 880,
        w: 240,
        note: 'Sábanas arrugadas. El villano no hace la cama.',
      },
      {
        id: 'wardrobe',
        art: 'wardrobe',
        label: 'Armario',
        x: 1800,
        y: 700,
        w: 130,
        note: 'Trajes de villano, todos iguales.',
      },
      {
        id: 'nightstand',
        art: 'table',
        label: 'Mesita',
        x: 1480,
        y: 1060,
        w: 80,
        note: 'Una lámpara y un libro de villanos famosos.',
      },
    ],
    exit: {
      kind: 'door',
      x: 1010,
      y: 1144,
      w: 120,
      label: 'Puerta principal',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'garden',
    theme: 'garden',
    name: 'El jardín del villano',
    map: { w: 1600, h: 1000 },
    intro:
      'La verja pide la llave y tu regalo. El cobertizo está cerrado con un código: busca el papel donde el villano lo apuntó.',
    floor: { x: 0, y: 0, w: 1600, h: 1000 },
    start: { x: 800, y: 700 },
    walls: [
      { x: 60, y: 60, w: 1480, h: 40 },
      { x: 60, y: 60, w: 40, h: 880 },
      { x: 1500, y: 60, w: 40, h: 880 },
      { x: 60, y: 900, w: 680, h: 40 },
      { x: 860, y: 900, w: 680, h: 40 },
      { x: 220, y: 340, w: 420, h: 44 },
      { x: 1140, y: 180, w: 44, h: 200 },
      { x: 880, y: 700, w: 420, h: 44 },
      { x: 300, y: 660, w: 260, h: 44 },
    ],
    labels: [],
    decor: [
      { art: 'path', x: 810, y: 760, w: 140, d: 380 },
      { art: 'tree', x: 200, y: 560, w: 220, solid: true },
      { art: 'tree', x: 1430, y: 640, w: 220, solid: true },
      { art: 'tree', x: 1020, y: 170, w: 200, solid: true },
    ],
    spots: [
      {
        id: 'shed',
        art: 'shed',
        label: 'Cobertizo',
        x: 290,
        y: 200,
        w: 260,
        content: 'safe',
        code: '7305',
      },
      {
        id: 'greenhouse',
        art: 'greenhouse',
        label: 'Invernadero',
        x: 1340,
        y: 320,
        w: 300,
        content: 'gift',
      },
      {
        id: 'fountain',
        art: 'fountain',
        label: 'Fuente',
        x: 820,
        y: 500,
        w: 240,
        note: 'Monedas en el fondo. Ninguna es la llave.',
      },
      {
        id: 'bench',
        art: 'bench',
        label: 'Banco',
        x: 420,
        y: 800,
        w: 210,
        content: 'paper',
        code: '7305',
      },
      {
        id: 'flowerbed',
        art: 'flowerbed',
        label: 'Parterre',
        x: 1120,
        y: 830,
        w: 230,
        note: 'Flores pisoteadas. Alguien ha pasado por aquí.',
      },
      {
        id: 'well',
        art: 'well',
        label: 'Pozo',
        x: 700,
        y: 250,
        w: 150,
        note: 'Un pozo seco. En el fondo solo hay un cubo sin cuerda.',
      },
      {
        id: 'statue',
        art: 'statue',
        label: 'Estatua',
        x: 1220,
        y: 560,
        w: 120,
        note: 'Una estatua del villano. Le han pintado bigote.',
      },
    ],
    exit: { kind: 'gate', x: 800, y: 920, w: 120, label: 'Verja del jardín' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'forest',
    theme: 'forest',
    name: 'El bosque',
    map: { w: 1600, h: 1000 },
    intro:
      'El sendero pide la llave y tu regalo. La tienda está cerrada con un código; el papel con la combinación anda cerca.',
    floor: { x: 0, y: 0, w: 1600, h: 1000 },
    start: { x: 1000, y: 840 },
    walls: [
      { x: 60, y: 60, w: 1480, h: 40 },
      { x: 60, y: 60, w: 40, h: 880 },
      { x: 1500, y: 60, w: 40, h: 880 },
      { x: 60, y: 900, w: 680, h: 40 },
      { x: 860, y: 900, w: 680, h: 40 },
    ],
    labels: [],
    decor: [
      { art: 'path', x: 820, y: 760, w: 140, d: 380 },
      { art: 'tree', x: 200, y: 220, w: 240, solid: true },
      { art: 'tree', x: 520, y: 520, w: 240, solid: true },
      { art: 'tree', x: 1050, y: 260, w: 240, solid: true },
      { art: 'tree', x: 1420, y: 520, w: 240, solid: true },
      { art: 'tree', x: 200, y: 800, w: 240, solid: true },
      { art: 'tree', x: 1450, y: 780, w: 240, solid: true },
    ],
    spots: [
      {
        id: 'log',
        art: 'log',
        label: 'Tronco hueco',
        x: 450,
        y: 320,
        w: 220,
        note: 'Hueco, oscuro y lleno de hojas. Nada más.',
      },
      {
        id: 'tent',
        art: 'tent',
        label: 'Tienda',
        x: 1300,
        y: 300,
        w: 240,
        content: 'safe',
        code: '1642',
      },
      {
        id: 'campfire',
        art: 'campfire',
        label: 'Hoguera',
        x: 830,
        y: 620,
        w: 170,
        note: 'Las brasas aún están calientes. Mejor no entretenerse.',
      },
      {
        id: 'rock',
        art: 'rock',
        label: 'Roca',
        x: 1150,
        y: 720,
        w: 200,
        note: 'Una roca enorme. Ni se mueve ni esconde nada.',
      },
      {
        id: 'cart',
        art: 'cart',
        label: 'Carro',
        x: 470,
        y: 760,
        w: 220,
        content: 'gift',
      },
      {
        id: 'stump',
        art: 'stump',
        label: 'Tocón',
        x: 700,
        y: 400,
        w: 110,
        note: 'Un tocón viejo. Sirve para sentarse, poco más.',
      },
      {
        id: 'sign',
        art: 'sign',
        label: 'Cartel',
        x: 1050,
        y: 450,
        w: 90,
        content: 'paper',
        code: '1642',
      },
    ],
    exit: { kind: 'gate', x: 800, y: 920, w: 120, label: 'Salida del bosque' },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'dungeon',
    theme: 'dungeon',
    name: 'El calabozo',
    map: { w: 1600, h: 1000 },
    intro:
      'La jaula del patito pide la llave y tu regalo. El cofre tiene un código; el papel está escondido en la otra celda.',
    floor: { x: 86, y: 86, w: 1428, h: 828 },
    rooms: [
      { x: 86, y: 86, w: 1428, h: 828, tone: '#4a4a55' },
    ],
    start: { x: 800, y: 860 },
    walls: [
      { x: 60, y: 60, w: 1480, h: 26 },
      { x: 60, y: 60, w: 26, h: 880 },
      { x: 1514, y: 60, w: 26, h: 880 },
      { x: 60, y: 914, w: 1480, h: 26 },
      { x: 600, y: 86, w: 26, h: 294 },
      { x: 974, y: 86, w: 26, h: 294 },
      { x: 600, y: 380, w: 140, h: 26 },
      { x: 860, y: 380, w: 140, h: 26 },
      { x: 86, y: 380, w: 274, h: 26 },
      { x: 86, y: 760, w: 274, h: 26 },
      { x: 360, y: 380, w: 26, h: 170 },
      { x: 360, y: 650, w: 26, h: 110 },
      { x: 1240, y: 380, w: 274, h: 26 },
      { x: 1240, y: 760, w: 274, h: 26 },
      { x: 1240, y: 380, w: 26, h: 170 },
      { x: 1240, y: 650, w: 26, h: 110 },
    ],
    labels: [],
    decor: [],
    spots: [
      {
        id: 'chest',
        art: 'chest',
        label: 'Cofre',
        x: 230,
        y: 570,
        w: 180,
        content: 'safe',
        code: '9087',
      },
      {
        id: 'skull',
        art: 'skull',
        label: 'Calavera',
        x: 1380,
        y: 570,
        w: 110,
        content: 'paper',
        code: '9087',
      },
      {
        id: 'torch',
        art: 'torch',
        label: 'Antorcha',
        x: 1120,
        y: 490,
        w: 100,
        note: 'La antorcha ilumina el pasillo. No hay nada detrás.',
      },
      {
        id: 'barrel',
        art: 'barrel',
        label: 'Barril',
        x: 520,
        y: 850,
        w: 130,
        note: 'Vacío. Huele a rayos.',
      },
      {
        id: 'straw',
        art: 'straw',
        label: 'Paja',
        x: 1080,
        y: 850,
        w: 190,
        content: 'gift',
      },
      {
        id: 'chains',
        art: 'chains',
        label: 'Cadenas',
        x: 620,
        y: 520,
        w: 100,
        note: 'Cadenas oxidadas. No llevan a ninguna parte.',
      },
    ],
    exit: { kind: 'cage', x: 800, y: 230, w: 220, label: 'Jaula' },
  },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/* ------------------------------------------------------------------
   Navegacion: rejilla de paso + busqueda de camino (A*).
   Permite tocar un objeto de otra habitacion y que la pata rodee los
   muros y entre por las puertas en vez de chocar contra la pared.
------------------------------------------------------------------ */
const CELL = 20
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function buildSolids(level) {
  const list = [...level.walls]

  /* Los muebles tambien ocupan sitio: la pata se acerca, no se sube. */
  for (const spot of level.spots) {
    const frame = isoFrameFor(spot.art, spot.w)
    const w = (frame ? frame.aw : spot.w) * 0.9
    const h = (frame ? frame.d : spot.w * 0.6) * 0.9
    list.push({
      x: spot.x - w / 2,
      y: spot.y - h / 2,
      w,
      h,
    })
  }

  for (const item of level.decor) {
    if (!item.solid) continue
    const size = item.w * FURNITURE_SCALE
    list.push({
      x: item.x - size / 2,
      y: item.y - size * 0.4,
      w: size,
      h: size * 0.8,
    })
  }

  list.push(
    level.exit.kind === 'cage'
      ? { x: level.exit.x - 100, y: level.exit.y - 70, w: 200, h: 140 }
      : {
          x: level.exit.x - level.exit.w / 2,
          y: level.exit.y - 24,
          w: level.exit.w,
          h: 48,
        }
  )

  return list
}

function circleHitsRect(x, y, rect, pad = 0) {
  const radius = PLAYER_R + pad
  return (
    x + radius > rect.x &&
    x - radius < rect.x + rect.w &&
    y + radius > rect.y &&
    y - radius < rect.y + rect.h
  )
}

function buildGrid(level) {
  const solids = buildSolids(level)
  const cols = Math.max(1, Math.ceil(level.map.w / CELL))
  const rows = Math.max(1, Math.ceil(level.map.h / CELL))
  const blocked = new Uint8Array(cols * rows)

  for (let cy = 0; cy < rows; cy += 1) {
    for (let cx = 0; cx < cols; cx += 1) {
      const x = cx * CELL + CELL / 2
      const y = cy * CELL + CELL / 2
      const index = cy * cols + cx

      if (
        x < 60 ||
        x > level.map.w - 60 ||
        y < 60 ||
        y > level.map.h - 60
      ) {
        blocked[index] = 1
        continue
      }
      if (solids.some((wall) => circleHitsRect(x, y, wall, 9))) {
        blocked[index] = 1
      }
    }
  }

  return { blocked, solids, cols, rows, mapW: level.map.w, mapH: level.map.h }
}

function clearLine(grid, a, b) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const steps = Math.max(1, Math.ceil(dist / 8))

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const x = a.x + (b.x - a.x) * t
    const y = a.y + (b.y - a.y) * t

    if (
      x < 60 ||
      x > grid.mapW - 60 ||
      y < 60 ||
      y > grid.mapH - 60
    ) {
      return false
    }
    if (grid.solids.some((wall) => circleHitsRect(x, y, wall, 7))) return false
  }

  return true
}

function smoothPath(grid, points) {
  if (points.length < 3) return points

  const out = [points[0]]
  let i = 0

  while (i < points.length - 1) {
    let j = points.length - 1
    while (j > i + 1 && !clearLine(grid, points[i], points[j])) j -= 1
    out.push(points[j])
    i = j
  }

  return out
}

function findPath(grid, from, to) {
  const { blocked, cols, rows } = grid
  const indexOf = (cx, cy) => cy * cols + cx
  let sx = clamp(Math.floor(from.x / CELL), 0, cols - 1)
  let sy = clamp(Math.floor(from.y / CELL), 0, rows - 1)
  let tx = clamp(Math.floor(to.x / CELL), 0, cols - 1)
  let ty = clamp(Math.floor(to.y / CELL), 0, rows - 1)
  const total = cols * rows

  /* Si la pata esta muy pegada a un mueble, su celda cuenta como
     bloqueada por el margen de seguridad: se arranca desde la celda
     libre mas cercana. */
  if (blocked[indexOf(sx, sy)]) {
    let found = null
    let foundDist = Infinity

    for (let r = 1; r <= 6 && !found; r += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue
          const nx = sx + dx
          const ny = sy + dy
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
          if (blocked[indexOf(nx, ny)]) continue
          const dist = Math.hypot(dx, dy)
          if (dist < foundDist) {
            foundDist = dist
            found = [nx, ny]
          }
        }
      }
    }

    if (!found) return null
    sx = found[0]
    sy = found[1]
  }

  const start = indexOf(sx, sy)

  /* Alcanzabilidad: si el destino cae en un muro, un mueble o una
     zona cerrada, se elige la celda alcanzable mas cercana. Asi tocar
     la puerta o un objeto siempre deja a la pata delante. */
  const reachable = new Uint8Array(total)
  const queue = [start]
  let head = 0
  reachable[start] = 1

  while (head < queue.length) {
    const current = queue[head]
    head += 1
    const cx = current % cols
    const cy = (current - cx) / cols

    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue

      const neighbour = indexOf(nx, ny)
      if (blocked[neighbour] || reachable[neighbour]) continue
      if (dx !== 0 && dy !== 0) {
        if (blocked[indexOf(cx + dx, cy)] || blocked[indexOf(cx, cy + dy)]) {
          continue
        }
      }

      reachable[neighbour] = 1
      queue.push(neighbour)
    }
  }

  const perfect = indexOf(tx, ty)
  if (!reachable[perfect]) {
    let best = -1
    let bestDist = Infinity

    for (let index = 0; index < total; index += 1) {
      if (!reachable[index]) continue
      const cx = index % cols
      const cy = (index - cx) / cols
      const x = cx * CELL + CELL / 2
      const y = cy * CELL + CELL / 2
      const dist = Math.hypot(x - to.x, y - to.y)
      if (dist < bestDist) {
        bestDist = dist
        best = index
      }
    }

    if (best < 0) return null
    tx = best % cols
    ty = (best - tx) / cols
  }

  const goal = indexOf(tx, ty)
  const gScore = new Float64Array(total).fill(Infinity)
  const fScore = new Float64Array(total).fill(Infinity)
  const came = new Int32Array(total).fill(-1)
  const inOpen = new Uint8Array(total)
  const open = [start]

  gScore[start] = 0
  fScore[start] = Math.hypot(tx - sx, ty - sy)
  inOpen[start] = 1

  while (open.length) {
    let best = 0
    for (let i = 1; i < open.length; i += 1) {
      if (fScore[open[i]] < fScore[open[best]]) best = i
    }

    const current = open[best]

    if (current === goal) {
      const points = []
      let node = current

      while (node !== -1) {
        const cx = node % cols
        const cy = (node - cx) / cols
        points.push({ x: cx * CELL + CELL / 2, y: cy * CELL + CELL / 2 })
        if (node === start) break
        node = came[node]
      }

      points.reverse()
      return smoothPath(grid, points)
    }

    open[best] = open[open.length - 1]
    open.pop()
    inOpen[current] = 0

    const cx = current % cols
    const cy = (current - cx) / cols

    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue

      const neighbour = indexOf(nx, ny)
      if (blocked[neighbour]) continue
      if (dx !== 0 && dy !== 0) {
        if (blocked[indexOf(cx + dx, cy)] || blocked[indexOf(cx, cy + dy)]) {
          continue
        }
      }

      const step = dx !== 0 && dy !== 0 ? 1.4142 : 1
      const score = gScore[current] + step

      if (score < gScore[neighbour]) {
        came[neighbour] = current
        gScore[neighbour] = score
        fScore[neighbour] = score + Math.hypot(tx - nx, ty - ny)
        if (!inOpen[neighbour]) {
          inOpen[neighbour] = 1
          open.push(neighbour)
        }
      }
    }
  }

  return null
}

export default function Gifts({ onBack }) {
  /* ---------- Fases ----------
     intro  -> escena de entrada (6 lineas)
     room   -> mapa jugable del scaperoom
     gift   -> overlay del regalo encontrado
     done   -> patito rescatado y mochila final
  */
  const [phase, setPhase] = useState('intro')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [guideIndex, setGuideIndex] = useState(0)
  const [levelIndex, setLevelIndex] = useState(0)
  const [found, setFound] = useState({})
  const [collected, setCollected] = useState([])
  const [keys, setKeys] = useState([])
  const [message, setMessage] = useState('')
  const [giftOverlay, setGiftOverlay] = useState(null)
  const [nearId, setNearId] = useState(null)
  const [walking, setWalking] = useState(false)
  const [facing, setFacing] = useState(1)
  const [papers, setPapers] = useState([])
  const [codeSpot, setCodeSpot] = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [bagOpen, setBagOpen] = useState(false)
  const [paperView, setPaperView] = useState(null)

  /* ---------- Refs del juego ---------- */
  const mapRef = useRef(null)
  const playerRef = useRef(null)
  const posRef = useRef({ ...LEVELS[0].start })
  const keysRef = useRef({ up: false, down: false, left: false, right: false })
  const targetRef = useRef(null)
  const pathRef = useRef(null)
  const pathIndexRef = useRef(0)
  const pendingRef = useRef(null)
  const nearRef = useRef(null)
  const walkingRef = useRef(false)
  const facingRef = useRef(1)
  const interactRef = useRef(() => {})
  const applyViewRef = useRef(() => {})
  const depthsRef = useRef([])
  const joyRef = useRef({ x: 0, y: 0 })
  const joyActiveRef = useRef(false)
  const joyBaseRef = useRef(null)
  const joyKnobRef = useRef(null)
  const pausedRef = useRef(false)
  const viewRef = useRef({ scale: 0.7, vw: 1280, vh: 900, safeTop: 104, safeH: 678 })

  /* Al entrar se corta cualquier voz de la seccion anterior y, al salir,
     la de esta escena. */
  useEffect(() => {
    stopDialogAudios()
    return stopDialogAudios
  }, [])

  const dialogue = DIALOGUES[dialogueIndex]
  const showEntryOverlay = phase === 'intro'

  useDialogueAudio(dialogue.audio, showEntryOverlay)

  /* El mensaje de abajo ya no existe: los avisos salen como toast y se
     apagan solos a los pocos segundos. */
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(() => setMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [message])

  const level = LEVELS[levelIndex]
  const view = useMemo(() => makeView(level.map), [level])
  const project = view.project
  const unproject = view.unproject
  const isLastLevel = levelIndex === LEVELS.length - 1
  const hasKey = level.spots.some(
    (spot) => spot.content === 'safe' && found[spot.id]
  )
  const hasGift = collected.includes(GIFTS[levelIndex].name)
  const hasPaper = level.spots.some(
    (spot) => spot.content === 'paper' && found[spot.id]
  )
  const roomReady = hasKey && hasGift
  pausedRef.current = Boolean(bagOpen || codeSpot)

  /* ---------- Mapa: estaciones y muros ---------- */
  const stations = [
    ...level.spots.map((spot) => ({ ...spot, kind: 'spot' })),
    {
      id: 'exit',
      kind: level.exit.kind,
      x: level.exit.x,
      y: level.exit.y,
      label: level.exit.label,
    },
  ]

  const solids = buildSolids(level)
  const grid = useMemo(() => buildGrid(level), [level])

  const nearStation = stations.find((station) => station.id === nearId) ?? null

  /* ---------- Colocacion del mapa (escala + camara) ---------- */
  const applyView = () => {
    const mapEl = mapRef.current
    if (!mapEl) return
    const { scale, vw, safeTop, safeH } = viewRef.current
    if (!scale) return
    const p = posRef.current
    const screen = project(p.x, p.y)
    const mapW = view.width * scale
    const mapH = view.height * scale

    let tx
    if (mapW <= vw) {
      tx = (vw - mapW) / 2
    } else {
      tx = clamp(vw / 2 - screen.x * scale, vw - mapW, 0)
    }

    let ty
    if (mapH <= safeH) {
      ty = safeTop + (safeH - mapH) / 2
    } else {
      ty = clamp(
        safeTop + safeH / 2 - screen.y * scale,
        safeTop + safeH - mapH,
        safeTop
      )
    }

    mapEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`
  }
  applyViewRef.current = applyView

  /* ---------- Medidas (una vez por sala y al redimensionar) ---------- */
  useLayoutEffect(() => {
    if (phase !== 'room' && phase !== 'gift') return

    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const narrow = vw <= 760
      const safeTop = narrow ? 98 : 104
      const safeBottom = narrow ? 146 : 168
      const safeH = Math.max(300, vh - safeTop - safeBottom)
      let scale = Math.min((vw - 24) / view.width, safeH / view.height)

      /* En vertical conviene ver toda la altura y desplazar la camara
         en horizontal, como si la casa se recorriera pasillo a pasillo. */
      if (narrow) scale = Math.min(0.72, safeH / view.height)
      scale = Math.max(0.4, scale)

      viewRef.current = { scale, vw, vh, safeTop, safeH }
      applyViewRef.current()
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phase, levelIndex])

  /* ---------- Posicion inicial de cada nivel ---------- */
  useLayoutEffect(() => {
    const start = LEVELS[levelIndex].start
    posRef.current = { ...start }
    targetRef.current = null
    pathRef.current = null
    pathIndexRef.current = 0
    pendingRef.current = null
    keysRef.current = { up: false, down: false, left: false, right: false }
    nearRef.current = null
    setNearId(null)
    walkingRef.current = false
    setWalking(false)
    facingRef.current = 1
    setFacing(1)
    setBagOpen(false)
    setPaperView(null)
    setCodeSpot(null)
    setCodeInput('')
    setCodeError(false)
    if (playerRef.current) {
      const screen = project(start.x, start.y)
      playerRef.current.style.left = `${screen.x}px`
      playerRef.current.style.top = `${screen.y}px`
    }
    applyViewRef.current()
  }, [levelIndex])

  /* ---------- Teclado ---------- */
  useEffect(() => {
    if (phase !== 'room') return

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault()
        keysRef.current.left = true
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault()
        keysRef.current.right = true
      } else if (key === 'arrowup' || key === 'w') {
        event.preventDefault()
        keysRef.current.up = true
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault()
        keysRef.current.down = true
      } else if (key === 'e' || key === ' ' || key === 'enter') {
        event.preventDefault()
        if (!pausedRef.current && nearRef.current) {
          interactRef.current(nearRef.current)
        }
      }
    }

    const onKeyUp = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = false
      else if (key === 'arrowright' || key === 'd')
        keysRef.current.right = false
      else if (key === 'arrowup' || key === 'w') keysRef.current.up = false
      else if (key === 'arrowdown' || key === 's') keysRef.current.down = false
    }

    const clearKeys = () => {
      keysRef.current = {
        up: false,
        down: false,
        left: false,
        right: false,
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
    }
  }, [phase])

  /* ---------- Bucle de movimiento ---------- */
  useEffect(() => {
    if (phase !== 'room') return

    let raf
    let last = performance.now()
    let lastFacing = 1

    const hitsWall = (x, y) =>
      solids.some(
        (wall) =>
          x + PLAYER_R > wall.x &&
          x - PLAYER_R < wall.x + wall.w &&
          y + PLAYER_R > wall.y &&
          y - PLAYER_R < wall.y + wall.h
      )

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (pausedRef.current) {
        raf = requestAnimationFrame(tick)
        return
      }

      const p = posRef.current

      let screenX =
        (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0)
      let screenY =
        (keysRef.current.down ? 1 : 0) - (keysRef.current.up ? 1 : 0)

      const joy = joyRef.current
      const joyMag = Math.hypot(joy.x, joy.y)
      if (joyMag > 0.18) {
        screenX = joy.x
        screenY = joy.y
      }

      const magnitude = Math.min(1, Math.hypot(screenX, screenY))
      const dirX = screenX + screenY
      const dirY = screenY - screenX
      let moved = false
      let arrived = false

      if (magnitude > 0.18) {
        targetRef.current = null
        pathRef.current = null
        pendingRef.current = null
        const len = Math.hypot(dirX, dirY) || 1
        const step = SPEED * magnitude * dt
        const dx = (dirX / len) * step
        const dy = (dirY / len) * step

        const nx = clamp(p.x + dx, 36, level.map.w - 36)
        if (!hitsWall(nx, p.y)) p.x = nx
        const ny = clamp(p.y + dy, 36, level.map.h - 36)
        if (!hitsWall(p.x, ny)) p.y = ny

        if (Math.abs(screenX) > 0.2) {
          facingRef.current = screenX > 0 ? 1 : -1
        }
        moved = true
      } else if (pathRef.current) {
        const route = pathRef.current
        let waypoint = route[pathIndexRef.current]
        let guard = 0

        while (
          waypoint &&
          Math.hypot(waypoint.x - p.x, waypoint.y - p.y) < 16 &&
          guard < 8
        ) {
          pathIndexRef.current += 1
          waypoint = route[pathIndexRef.current]
          guard += 1
        }

        if (!waypoint) {
          pathRef.current = null
          targetRef.current = null
          arrived = true
        } else {
          const ddx = waypoint.x - p.x
          const ddy = waypoint.y - p.y
          const dist = Math.hypot(ddx, ddy)
          const step = Math.min(SPEED * dt, dist)

          const nx = clamp(p.x + (ddx / dist) * step, 36, level.map.w - 36)
          if (!hitsWall(nx, p.y)) p.x = nx
          const ny = clamp(p.y + (ddy / dist) * step, 36, level.map.h - 36)
          if (!hitsWall(p.x, ny)) p.y = ny

          const screenDx = ddx - ddy
          if (Math.abs(screenDx) > 4) facingRef.current = screenDx > 0 ? 1 : -1
          moved = true
        }
      } else if (targetRef.current) {
        const t = targetRef.current
        const ddx = t.x - p.x
        const ddy = t.y - p.y
        const dist = Math.hypot(ddx, ddy)
        const stop = t.stationId ? STATION_STOP : 8

        if (dist <= stop) {
          targetRef.current = null
        } else {
          const step = Math.min(SPEED * dt, Math.max(0, dist - stop))
          const nx = clamp(p.x + (ddx / dist) * step, 36, level.map.w - 36)
          if (!hitsWall(nx, p.y)) p.x = nx
          const ny = clamp(p.y + (ddy / dist) * step, 36, level.map.h - 36)
          if (!hitsWall(p.x, ny)) p.y = ny
          const screenDx = ddx - ddy
          if (Math.abs(screenDx) > 4) facingRef.current = screenDx > 0 ? 1 : -1
          moved = true
        }
      }

      if (playerRef.current) {
        const screen = project(p.x, p.y)
        playerRef.current.style.left = `${screen.x}px`
        playerRef.current.style.top = `${screen.y}px`

        const depths = depthsRef.current
        const depth = p.x + p.y
        let lo = 0
        let hi = depths.length
        while (lo < hi) {
          const mid = (lo + hi) >> 1
          if (depths[mid] < depth) lo = mid + 1
          else hi = mid
        }
        playerRef.current.style.zIndex = String(10 + lo)
      }
      applyViewRef.current()

      if (moved !== walkingRef.current) {
        walkingRef.current = moved
        setWalking(moved)
      }
      if (facingRef.current !== lastFacing) {
        lastFacing = facingRef.current
        setFacing(lastFacing)
      }

      /* Estacion mas cercana para el aviso */
      let nearest = null
      let nearestDist = INTERACT
      for (const station of stations) {
        const dist = Math.hypot(station.x - p.x, station.y - p.y)
        if (dist <= nearestDist) {
          nearest = station
          nearestDist = dist
        }
      }
      const nearestId = nearest ? nearest.id : null
      if (nearestId !== nearRef.current) {
        nearRef.current = nearestId
        setNearId(nearestId)
      }

      /* Si veniamos andando hacia un objeto, se registra al llegar */
      if (pendingRef.current) {
        const st = stations.find((s) => s.id === pendingRef.current)
        if (st) {
          const dist = Math.hypot(st.x - p.x, st.y - p.y)
          const auto =
            st.kind === 'spot'
              ? AUTO_SPOT
              : st.kind === 'cage'
                ? AUTO_CAGE
                : AUTO_EXIT
          if ((arrived && dist <= INTERACT) || dist <= auto) {
            pendingRef.current = null
            targetRef.current = null
            pathRef.current = null
            interactRef.current(st.id)
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, levelIndex])

  /* ---------- Escena de entrada ---------- */
  const advanceDialogue = () => {
    if (dialogueIndex < DIALOGUES.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      setGuideIndex(0)
      setPhase('guide')
    }
  }

  const advanceGuide = () => {
    if (guideIndex < GUIDE.length - 1) {
      setGuideIndex(guideIndex + 1)
    } else {
      setPhase('room')
    }
  }

  /* ---------- Scaperoom ---------- */
  const searchSpot = (spot) => {
    playClickSfx()

    if (found[spot.id]) {
      if (spot.content === 'safe') {
        setMessage('La caja fuerte ya está abierta.')
      } else if (spot.content === 'gift') {
        setMessage('El regalo de esta sala ya está en tu mochila.')
      } else if (spot.content === 'paper') {
        setMessage('Ese papel ya está guardado en la mochila.')
      } else {
        setMessage('Ya has registrado ese sitio. No hay nada más.')
      }
      return
    }

    if (spot.content === 'safe') {
      setCodeInput('')
      setCodeError(false)
      setCodeSpot(spot)
      return
    }

    if (spot.content === 'paper') {
      setFound((prev) => ({ ...prev, [spot.id]: true }))
      setPapers((prev) => [
        ...prev,
        {
          id: spot.id,
          level: levelIndex,
          code: spot.code,
          where: level.name,
          label: spot.label,
        },
      ])
      setMessage(
        'Has encontrado un papel con un código. Guárdalo en la mochila y ábrelo para leerlo.'
      )
      return
    }

    setFound((prev) => ({ ...prev, [spot.id]: true }))

    if (spot.content === 'gift') {
      setCollected((prev) =>
        prev.includes(GIFTS[levelIndex].name)
          ? prev
          : [...prev, GIFTS[levelIndex].name]
      )
      setGiftOverlay(GIFTS[levelIndex])
      setPhase('gift')
    } else {
      setMessage(spot.note)
    }
  }

  const pressCode = (digit) => {
    if (!codeSpot || codeError) return
    const next = `${codeInput}${digit}`.slice(0, 4)
    setCodeInput(next)

    if (next.length < 4) return

    if (next === codeSpot.code) {
      setFound((prev) => ({ ...prev, [codeSpot.id]: true }))
      setKeys((prev) => [
        ...prev.filter((key) => key.level !== levelIndex),
        { level: levelIndex, id: codeSpot.id },
      ])
      setMessage(
        `El código abre ${codeSpot.label}. ¡La llave está dentro!`
      )
      playClickSfx()
      window.setTimeout(() => {
        setCodeSpot(null)
        setCodeInput('')
      }, 650)
    } else {
      setCodeError(true)
      playClickSfx()
      window.setTimeout(() => {
        setCodeInput('')
        setCodeError(false)
      }, 500)
    }
  }

  const eraseCode = () => {
    if (codeError) return
    setCodeInput((prev) => prev.slice(0, -1))
  }

  const closeCode = () => {
    setCodeSpot(null)
    setCodeInput('')
    setCodeError(false)
  }

  const closeGiftOverlay = () => {
    setGiftOverlay(null)
    setPhase('room')
    setMessage(
      hasKey
        ? 'El regalo ya está en tu mochila. ¡También tienes la llave! Ve a la salida.'
        : 'El regalo ya está en tu mochila. Ahora abre la caja fuerte para conseguir la llave.'
    )
  }

  const handleExit = () => {
    const kind = level.exit.kind
    const closedText =
      kind === 'cage'
        ? 'La jaula está cerrada con llave. Tendrás que encontrarla.'
        : kind === 'gate'
          ? 'La verja está cerrada con llave. Búscala abriendo la caja fuerte.'
          : 'La puerta está cerrada con llave. Búscala abriendo la caja fuerte.'

    if (!hasKey) {
      setMessage(closedText)
      return
    }

    if (!hasGift) {
      setMessage('¡Espera! Aún no has cogido tu regalo. Está escondido en este nivel.')
      return
    }

    playClickSfx()

    setKeys((prev) => prev.filter((key) => key.level !== levelIndex))

    if (isLastLevel) {
      setPhase('done')
      return
    }

    const next = levelIndex + 1
    setLevelIndex(next)
    setFound({})
    setPhase('room')
  }

  const restartAll = () => {
    setCollected([])
    setKeys([])
    setPapers([])
    setFound({})
    setGiftOverlay(null)
    setBagOpen(false)
    setPaperView(null)
    setCodeSpot(null)
    setLevelIndex(0)
    setMessage('')
    setPhase('room')
    posRef.current = { ...LEVELS[0].start }
  }

  const interactStation = (id) => {
    if (id === 'exit') {
      handleExit()
      return
    }
    const spot = level.spots.find((item) => item.id === id)
    if (spot) searchSpot(spot)
  }

  interactRef.current = interactStation

  /* ---------- Controles ---------- */
  const routeTo = (x, y) => {
    const path = findPath(grid, posRef.current, { x, y })
    if (path && path.length) {
      pathRef.current = path
      pathIndexRef.current = 0
    } else {
      pathRef.current = null
    }
    targetRef.current = { x, y }
  }

  const goToStation = (station) => {
    if (nearRef.current === station.id) {
      interactRef.current(station.id)
      return
    }
    routeTo(station.x, station.y)
    targetRef.current = {
      x: station.x,
      y: station.y,
      stationId: station.id,
    }
    pendingRef.current = station.id
  }

  const handleMapClick = (event) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    const scale = viewRef.current.scale || 1
    const px = (event.clientX - rect.left) / scale
    const py = (event.clientY - rect.top) / scale
    const point = unproject(px, py)
    const x = clamp(point.x, 36, level.map.w - 36)
    const y = clamp(point.y, 36, level.map.h - 36)
    routeTo(x, y)
    pendingRef.current = null
  }

  /* ---------- Joystick tactil ---------- */
  const updateJoy = (event) => {
    const rect = joyBaseRef.current?.getBoundingClientRect()
    if (!rect) return
    const radius = rect.width * 0.28
    let dx = event.clientX - (rect.left + rect.width / 2)
    let dy = event.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > radius) {
      dx = (dx / len) * radius
      dy = (dy / len) * radius
    }
    joyRef.current = { x: dx / radius, y: dy / radius }
    if (joyKnobRef.current) {
      joyKnobRef.current.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`
    }
  }

  const startJoy = (event) => {
    event.preventDefault()
    joyActiveRef.current = true
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    updateJoy(event)
  }

  const moveJoy = (event) => {
    if (!joyActiveRef.current) return
    updateJoy(event)
  }

  const endJoy = () => {
    joyActiveRef.current = false
    joyRef.current = { x: 0, y: 0 }
    if (joyKnobRef.current) {
      joyKnobRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }

  const holdMove = (side, pressed) => {
    keysRef.current[side] = pressed
  }

  /* ---------- Textos de interaccion ---------- */
  const missingParts = []
  if (!hasKey) missingParts.push('la llave')
  if (!hasGift) missingParts.push('el regalo')
  const missingText = missingParts.length
    ? `Falta ${missingParts.join(' y ')}`
    : 'Todo listo'

  let promptText = null
  let actionLabel = null
  if (nearStation) {
    if (nearStation.kind === 'spot') {
      const searched = Boolean(found[nearStation.id])
      if (nearStation.content === 'safe') {
        promptText = searched ? 'Abierta' : 'Cerrada con código'
        actionLabel = searched ? 'Abierta' : 'Código'
      } else if (nearStation.content === 'paper') {
        promptText = searched ? 'Papel guardado' : 'Coger papel'
        actionLabel = searched ? 'Guardado' : 'Coger papel'
      } else {
        promptText = searched ? 'Ya registrado' : 'Registrar'
        actionLabel = searched ? 'Ya registrado' : 'Registrar'
      }
    } else if (nearStation.kind === 'cage') {
      promptText = roomReady ? 'Rescatar al patito' : missingText
      actionLabel = roomReady ? 'Rescatar' : missingText
    } else {
      promptText = roomReady ? 'Abrir la salida' : missingText
      actionLabel = roomReady ? 'Abrir' : missingText
    }
  }

  const bagGifts = GIFTS.filter((g) => collected.includes(g.name))
  const bagItems = [
    ...bagGifts.map((gift) => ({
      key: `gift-${gift.name}`,
      kind: 'gift',
      gift,
    })),
    ...keys.map((key) => ({
      key: `key-${key.level}-${key.id}`,
      kind: 'key',
    })),
    ...papers.map((paper) => ({
      key: `paper-${paper.level}-${paper.id}`,
      kind: 'paper',
      paper,
    })),
  ]
  const bagCount = bagItems.length

  /* Orden de dibujo: primero lo mas lejano (menos x+y).
     Los muros se parten en trozos para que su profundidad sea local y no
     tapen muebles que estan por delante. */
  const wallItems = []
  level.walls.forEach((wall, wallIndex) => {
    const horizontal = wall.w >= wall.h
    const length = horizontal ? wall.w : wall.h
    const count = Math.max(1, Math.round(length / 90))
    const size = length / count
    for (let i = 0; i < count; i += 1) {
      const piece = horizontal
        ? { x: wall.x + i * size, y: wall.y, w: size, h: wall.h }
        : { x: wall.x, y: wall.y + i * size, w: wall.w, h: size }
      wallItems.push({
        kind: 'wall',
        key: `wall-${wallIndex}-${i}`,
        wall: piece,
        depth: piece.x + piece.w / 2 + piece.y + piece.h / 2,
      })
    }
  })

  const renderItems = [
    ...wallItems,
    ...level.decor
      .filter((item) => item.art === 'tree')
      .map((tree, index) => ({
        kind: 'tree',
        key: `tree-${index}`,
        tree,
        depth: tree.x + tree.y,
      })),
    ...level.spots.map((spot) => ({
      kind: 'spot',
      spot,
      depth: spot.x + spot.y,
    })),
    { kind: 'exit', key: 'exit', depth: level.exit.x + level.exit.y },
  ].sort((a, b) => a.depth - b.depth)

  depthsRef.current = renderItems.map((item) => item.depth)

  return (
    <main className="gifts">
      {/* Escena de entrada */}
      {showEntryOverlay && (
        <div className="gifts-overlay" onClick={advanceDialogue}>
          <div className="gifts-overlay__dialog">
            <div className="gifts-overlay__bubble">
              <p className="gifts-overlay__text">{dialogue.text}</p>
              {dialogue.name && (
                <p className="gifts-overlay__name">{dialogue.name}</p>
              )}
            </div>
            <img
              src={dialogue.image}
              alt={dialogue.alt}
              className="gifts-overlay__duck"
            />
          </div>
        </div>
      )}

      {/* Instrucciones antes de empezar */}
      {phase === 'guide' && (
        <div className="gifts-guide" onClick={advanceGuide}>
          <div className="gifts-guide__card glass">
            <img
              src={patoEstera}
              alt=""
              className="gifts-guide__avatar"
            />
            <p className="gifts-guide__step">
              {guideIndex + 1} / {GUIDE.length}
            </p>
            <p className="gifts-guide__text">{GUIDE[guideIndex]}</p>
            <p className="gifts-guide__hint">Toca para continuar</p>
          </div>
        </div>
      )}

      {/* Juego isometrico */}
      {(phase === 'room' || phase === 'gift') && (
        <section className={`gifts-game gifts-game--${level.theme}`}>
          <div className="gifts-scene">
            <div
              className="gifts-iso"
              ref={mapRef}
              onClick={handleMapClick}
              aria-label="Escenario isométrico: toca el suelo para moverte"
            >
              <svg
                className="gifts-iso__floor"
                width={view.width}
                height={view.height}
                viewBox={`0 0 ${view.width} ${view.height}`}
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id={`gifts-floor-${level.id}`}
                    width="54"
                    height="30"
                    patternUnits="userSpaceOnUse"
                  >
                    {level.theme === 'garden' || level.theme === 'forest' ? (
                      <>
                        <circle cx="12" cy="9" r="1.6" fill="rgba(255,255,255,0.16)" />
                        <circle cx="34" cy="21" r="1.2" fill="rgba(0,0,0,0.18)" />
                      </>
                    ) : (
                      <>
                        <path
                          d="M0 0 L54 27"
                          stroke="rgba(0,0,0,0.2)"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M0 27 L54 0"
                          stroke="rgba(0,0,0,0.09)"
                          strokeWidth="1"
                        />
                      </>
                    )}
                  </pattern>
                </defs>

                <polygon
                  points={floorQuad(project, level.floor)}
                  fill={FLOOR_FILL[level.theme]}
                />
                {(level.rooms ?? []).map((room, index) => (
                  <polygon
                    key={`room-${index}`}
                    points={floorQuad(project, room)}
                    fill={room.tone}
                  />
                ))}
                <polygon
                  points={floorQuad(project, level.floor)}
                  fill={`url(#gifts-floor-${level.id})`}
                />

                {level.decor
                  .filter((item) => item.art === 'rug')
                  .map((item, index) => (
                    <g key={`rug-${index}`}>
                      <polygon
                        points={centeredQuad(project, item.x, item.y, item.w, item.d)}
                        fill="#7a3f59"
                        opacity="0.85"
                      />
                      <polygon
                        points={centeredQuad(project, item.x, item.y, item.w, item.d, 16)}
                        fill="none"
                        stroke="#d9a86a"
                        strokeWidth="3"
                        opacity="0.6"
                      />
                    </g>
                  ))}

                {level.decor
                  .filter((item) => item.art === 'path')
                  .map((item, index) => (
                    <g key={`path-${index}`}>
                      <polygon
                        points={centeredQuad(project, item.x, item.y, item.w, item.d)}
                        fill="#c8b795"
                        opacity="0.5"
                      />
                      {Array.from({ length: 6 }).map((_, stone) => {
                        const sy =
                          item.y + (stone / 5 - 0.5) * item.d * 0.78
                        const p = project(item.x, sy)
                        return (
                          <ellipse
                            key={stone}
                            cx={p.x}
                            cy={p.y}
                            rx={item.w * 0.16}
                            ry={item.w * 0.07}
                            fill="#d4c5a8"
                            opacity="0.85"
                          />
                        )
                      })}
                    </g>
                  ))}
              </svg>

              {/* Muros, arboles, objetos y salida ordenados por profundidad */}
              {renderItems.map((item, index) => {
                const zIndex = 10 + index

                if (item.kind === 'wall') {
                  const { wall } = item
                  const ext = isoExtent(
                    wall.w,
                    wall.h,
                    WALL_HEIGHT[level.theme],
                    14
                  )
                  const center = project(
                    wall.x + wall.w / 2,
                    wall.y + wall.h / 2
                  )
                  const colors = WALL_COLORS[level.theme]

                  return (
                    <span
                      key={item.key}
                      className="gifts-iso__wall"
                      style={{
                        left: `${center.x - ext.width / 2}px`,
                        top: `${center.y - ext.top}px`,
                        width: `${ext.width}px`,
                        zIndex,
                      }}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox={`${-ext.width / 2} ${-ext.top} ${ext.width} ${
                          ext.top + ext.bottom
                        }`}
                      >
                        <IsoBox
                          x={-wall.w / 2}
                          y={-wall.h / 2}
                          w={wall.w}
                          d={wall.h}
                          h={WALL_HEIGHT[level.theme]}
                          top={colors.top}
                          left={colors.left}
                          right={colors.right}
                        />
                      </svg>
                    </span>
                  )
                }

                if (item.kind === 'tree') {
                  const { tree } = item
                  const frame = isoFrameFor('tree', tree.w)
                  const center = project(tree.x, tree.y)
                  return (
                    <span
                      key={item.key}
                      className="gifts-iso__tree"
                      style={{
                        left: `${center.x - frame.width / 2}px`,
                        top: `${center.y - frame.top}px`,
                        width: `${frame.width}px`,
                        zIndex,
                      }}
                      aria-hidden="true"
                    >
                      <IsoArt name="tree" w={tree.w} />
                    </span>
                  )
                }

                if (item.kind === 'spot') {
                  const { spot } = item
                  const frame = isoFrameFor(spot.art, spot.w)
                  const center = project(spot.x, spot.y)
                  const searched = Boolean(found[spot.id])
                  const isGift = spot.content === 'gift'
                  const isPaper = spot.content === 'paper'
                  const isSafe = spot.content === 'safe'
                  const isNear = nearId === spot.id

                  return (
                    <button
                      key={spot.id}
                      type="button"
                      className={[
                        'gifts-iso__spot',
                        'gifts-station',
                        searched && 'is-searched',
                        isNear && 'is-near',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        left: `${center.x - frame.width / 2}px`,
                        top: `${center.y - frame.top}px`,
                        width: `${frame.width}px`,
                        '--base': `${frame.top}px`,
                        zIndex,
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        goToStation(spot)
                      }}
                      aria-label={`Registrar ${spot.label}`}
                    >
                      <IsoArt name={spot.art} w={spot.w} />
                      {searched && (
                        <span
                          className="gifts-station__mark"
                          aria-hidden="true"
                        >
                          {isSafe ? (
                            <KeyIcon />
                          ) : isGift ? (
                            <GiftIcon />
                          ) : isPaper ? (
                            <PaperIcon />
                          ) : (
                            <CheckIcon />
                          )}
                        </span>
                      )}
                      {isNear && promptText && (
                        <span className="gifts-object__prompt" role="status">
                          {promptText}
                        </span>
                      )}
                    </button>
                  )
                }

                /* salida: puerta, verja o jaula */
                const frame = isoFrameFor(
                  level.exit.kind === 'cage'
                    ? 'cage'
                    : level.exit.kind === 'gate'
                      ? 'gate'
                      : 'door',
                  level.exit.w
                )
                const center = project(level.exit.x, level.exit.y)

                return (
                  <button
                    key="exit"
                    type="button"
                    className={[
                      'gifts-iso__exit',
                      'gifts-station',
                      nearId === 'exit' && 'is-near',
                      roomReady && 'is-ready',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      left: `${center.x - frame.width / 2}px`,
                      top: `${center.y - frame.top}px`,
                      width: `${frame.width}px`,
                      '--base': `${frame.top}px`,
                      zIndex,
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      goToStation({
                        id: 'exit',
                        x: level.exit.x,
                        y: level.exit.y,
                      })
                    }}
                    aria-label={level.exit.label}
                  >
                    {level.exit.kind === 'cage' ? (
                      <span className="gifts-cage">
                        <img
                          src={patoChicoTriste}
                          alt=""
                          className="gifts-cage__duck"
                        />
                        <IsoArt name="cage" w={level.exit.w} />
                      </span>
                    ) : (
                      <IsoArt
                        name={level.exit.kind === 'gate' ? 'gate' : 'door'}
                        w={level.exit.w}
                      />
                    )}
                    <span className="gifts-station__lock" aria-hidden="true">
                      {roomReady ? <UnlockIcon /> : <LockIcon />}
                    </span>
                    {nearId === 'exit' && promptText && (
                      <span className="gifts-object__prompt" role="status">
                        {promptText}
                      </span>
                    )}
                  </button>
                )
              })}

              {/* Personaje */}
              <div
                className={`gifts-player${walking ? ' is-walking' : ''}`}
                ref={playerRef}
                style={{
                  left: `${project(level.start.x, level.start.y).x}px`,
                  top: `${project(level.start.x, level.start.y).y}px`,
                  '--lean': facing > 0 ? '6deg' : '-6deg',
                }}
              >
                <span className="gifts-player__shadow" aria-hidden="true" />
                <div className="gifts-player__lean">
                  <div
                    className={`gifts-player__flip${
                      facing > 0 ? ' is-mirrored' : ''
                    }`}
                  >
                    <img
                      src={patoEstera}
                      alt="Patita"
                      className="gifts-player__img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <span className="gifts-game__vignette" aria-hidden="true" />

          {/* HUD superior */}
          <header className="gifts-hud">
            <GlassButton
              variant="ghost"
              size="sm"
              className="gifts-hud__menu"
              onClick={onBack}
              title="Volver al menú"
            >
              ←
            </GlassButton>
          </header>

          <button
            type="button"
            className="gifts-bagbtn glass"
            onClick={() => setBagOpen(true)}
            aria-label={`Abrir mochila (${bagCount} objetos)`}
          >
            <BackpackIcon />
            <span className="gifts-bagbtn__count">{bagCount}</span>
          </button>

          {/* Estado de la sala */}
          <div className="gifts-hud__status">
            <span className={hasKey ? 'is-on' : ''}>
              <KeyIcon />
              Llave
            </span>
            <span className={hasGift ? 'is-on' : ''}>
              <GiftIcon />
              Regalo
            </span>
            <span className={hasPaper ? 'is-on' : ''}>
              <PaperIcon />
              Código
            </span>
          </div>

          {message && (
            <div className="gifts-toast glass" role="status">
              {message}
            </div>
          )}

          {/* HUD inferior */}
          <div className="gifts-hud__bottom">
            <div className="gifts-dpad" aria-label="Mover a la pata">
              <button
                type="button"
                className="gifts-dpad__btn gifts-dpad__btn--up glass"
                aria-label="Mover arriba"
                onPointerDown={(event) => {
                  event.preventDefault()
                  holdMove('up', true)
                }}
                onPointerUp={() => holdMove('up', false)}
                onPointerLeave={() => holdMove('up', false)}
                onPointerCancel={() => holdMove('up', false)}
                onContextMenu={(event) => event.preventDefault()}
              >
                ▲
              </button>
              <button
                type="button"
                className="gifts-dpad__btn gifts-dpad__btn--left glass"
                aria-label="Mover a la izquierda"
                onPointerDown={(event) => {
                  event.preventDefault()
                  holdMove('left', true)
                }}
                onPointerUp={() => holdMove('left', false)}
                onPointerLeave={() => holdMove('left', false)}
                onPointerCancel={() => holdMove('left', false)}
                onContextMenu={(event) => event.preventDefault()}
              >
                ◀
              </button>
              <button
                type="button"
                className="gifts-dpad__btn gifts-dpad__btn--right glass"
                aria-label="Mover a la derecha"
                onPointerDown={(event) => {
                  event.preventDefault()
                  holdMove('right', true)
                }}
                onPointerUp={() => holdMove('right', false)}
                onPointerLeave={() => holdMove('right', false)}
                onPointerCancel={() => holdMove('right', false)}
                onContextMenu={(event) => event.preventDefault()}
              >
                ▶
              </button>
              <button
                type="button"
                className="gifts-dpad__btn gifts-dpad__btn--down glass"
                aria-label="Mover abajo"
                onPointerDown={(event) => {
                  event.preventDefault()
                  holdMove('down', true)
                }}
                onPointerUp={() => holdMove('down', false)}
                onPointerLeave={() => holdMove('down', false)}
                onPointerCancel={() => holdMove('down', false)}
                onContextMenu={(event) => event.preventDefault()}
              >
                ▼
              </button>
            </div>

            <div className="gifts-hud__joystick">
              <div
                className="gifts-joystick glass"
                ref={joyBaseRef}
                role="group"
                aria-label="Joystick de movimiento"
                onPointerDown={startJoy}
                onPointerMove={moveJoy}
                onPointerUp={endJoy}
                onPointerCancel={endJoy}
                onLostPointerCapture={endJoy}
                onContextMenu={(event) => event.preventDefault()}
              >
                <span className="gifts-joystick__cross" aria-hidden="true" />
                <span className="gifts-joystick__knob" ref={joyKnobRef} />
              </div>
            </div>

            <div className="gifts-hud__action">
              {nearStation && (
                <button
                  type="button"
                  className="gifts-control gifts-control--action glass"
                  onClick={() => interactRef.current(nearStation.id)}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`gifts-rtouch${nearStation ? ' is-on' : ''}`}
            disabled={!nearStation}
            onClick={() => {
              if (nearStation) interactRef.current(nearStation.id)
            }}
            aria-label="Acción"
          >
            R
          </button>
        </section>
      )}

      {/* Caja fuerte con código */}
      {phase === 'room' && codeSpot && (
        <div className="gifts-code-overlay" onClick={closeCode}>
          <div
            className={`gifts-code glass${codeError ? ' is-error' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="gifts-code__eyebrow">Cerrada con código</p>
            <h3 className="gifts-code__title">{codeSpot.label}</h3>
            <div className="gifts-code__slots" aria-label="Código introducido">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={codeInput[i] ? 'is-filled' : ''}>
                  {codeInput[i] ?? ''}
                </span>
              ))}
            </div>
            <div className="gifts-code__pad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="gifts-code__key glass"
                  onClick={() => pressCode(digit)}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="gifts-code__key gifts-code__key--erase glass"
                onClick={eraseCode}
                aria-label="Borrar"
              >
                ←
              </button>
              <button
                type="button"
                className="gifts-code__key glass"
                onClick={() => pressCode('0')}
              >
                0
              </button>
              <button
                type="button"
                className="gifts-code__key gifts-code__key--close glass"
                onClick={closeCode}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p className="gifts-code__hint">
              {codeError
                ? 'Código incorrecto. Míralo en la mochila.'
                : 'El código está apuntado en un papel. Ábrelo en la mochila.'}
            </p>
          </div>
        </div>
      )}

      {/* Mochila */}
      {bagOpen && (
        <div className="gifts-bag-overlay" onClick={() => setBagOpen(false)}>
          <div
            className="gifts-bag glass"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="gifts-bag__head">
              <h2 className="gifts-bag__title">Mochila</h2>
              <button
                type="button"
                className="gifts-bag__close glass"
                onClick={() => setBagOpen(false)}
                aria-label="Cerrar mochila"
              >
                ×
              </button>
            </header>

            <div className="gifts-bag__grid">
              {bagItems.length ? (
                bagItems.map((item) => {
                  if (item.kind === 'gift') {
                    return (
                      <div
                        key={item.key}
                        className="gifts-bag__item"
                        title={item.gift.name}
                      >
                        <img src={item.gift.image} alt={item.gift.name} />
                      </div>
                    )
                  }
                  if (item.kind === 'key') {
                    return (
                      <div
                        key={item.key}
                        className="gifts-bag__item gifts-bag__item--key"
                        title="Llave"
                      >
                        <KeyIcon />
                      </div>
                    )
                  }
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="gifts-bag__item gifts-bag__item--paper"
                      title="Papel con código"
                      onClick={() => setPaperView(item.paper)}
                    >
                      <PaperIcon />
                    </button>
                  )
                })
              ) : (
                <p className="gifts-bag__empty">
                  Tu mochila está vacía. Registra objetos para encontrar cosas.
                </p>
              )}
            </div>

            <p className="gifts-bag__tip">
              Toca un papel para ver el código de cerca.
            </p>
          </div>
        </div>
      )}

      {paperView && (
        <div
          className="gifts-note-overlay"
          onClick={() => setPaperView(null)}
        >
          <div className="gifts-note">
            <p className="gifts-note__eyebrow">{paperView.where}</p>
            <p className="gifts-note__label">{paperView.label}</p>
            <p className="gifts-note__intro">El código es</p>
            <p className="gifts-note__code">{paperView.code}</p>
            <p className="gifts-note__hint">Toca para volver a la mochila</p>
          </div>
        </div>
      )}

      {/* Overlay del regalo encontrado */}
      {phase === 'gift' && giftOverlay && (
        <div className="gifts-overlay" onClick={closeGiftOverlay}>
          <div className="gifts-overlay__dialog">
            <div className="gifts-overlay__bubble">
              <p className="gifts-overlay__text">
                ¡Has encontrado {giftOverlay.name}!
              </p>
              <p className="gifts-overlay__name">Guardado en tu mochila</p>
              <p className="gifts-overlay__hint">Toca para seguir buscando</p>
            </div>

            <div className="gifts-gift">
              <span className="gifts-gift__visual">
                <img src={giftOverlay.image} alt={giftOverlay.name} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Final: patito rescatado */}
      {phase === 'done' && (
        <section className="gifts__stage">
          <div className="gifts__panel glass">
            <p className="gifts__eyebrow">Prueba completada</p>
            <h2 className="gifts__title">¡Has rescatado al patito!</h2>

            <img
              src={patoChicoRescatado}
              alt="Patito rescatado y celebrando"
              className="gifts__rescued"
            />

            <p className="gifts__text">
              El villano se ha quedado sin palabras. Esto es todo lo que has
              ido guardando en tu mochila:
            </p>

            <ul className="gifts__collection">
              {GIFTS.map((g) => (
                <li key={g.name}>
                  <img
                    src={g.image}
                    alt=""
                    className="gifts__collection-thumb"
                  />
                  <span>{g.name}</span>
                </li>
              ))}
            </ul>

            <p className="gifts__text">
              Recuerdas estos regalos y más, mi amor. Mereces esto y{' '}
              <strong>un infinito</strong>.
            </p>

            <div className="gifts__actions">
              <GlassButton variant="ghost" onClick={onBack}>
                Volver al menú
              </GlassButton>
              <GlassButton variant="accent" onClick={restartAll}>
                Jugar otra vez
              </GlassButton>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
