// Personal de AGREPA ASFALCEM.
//
// Fuente: personal.pages (documento del cliente). El nombre, telefono y correo
// se transcribieron tal cual aparecen ahi; las fotos se extrajeron del mismo
// archivo y se asignaron leyendo los anclajes internos del documento, no por
// orden de nombre de archivo.
//
// - foto: null  -> la persona no tiene fotografia en el documento; se usa el
//                  avatar generico.
// - pos:        -> encuadre CSS (object-position) de esa foto dentro del hexagono.
// - cargo:      -> pendiente. El documento no trae cargos. Al rellenarlo aqui
//                  aparece bajo el nombre en el panal, la ficha y el directorio.
// - q, r:       -> coordenadas axiales del hexagono en el panal.
//
// Tras editar este archivo: node scripts/generar-equipo.mjs

export const EQUIPO = [
  // --- anillo interior ---
  { nombre: 'Kelin Cardozo',      cargo: '', tel: '0412-589-81-11', mail: 'kelincardozo@gmail.com',      foto: 'kelin-cardozo.jpg',      pos: '50% 26%', q: 0,  r: -1 },
  { nombre: 'Carlos Luis Mejias', cargo: '', tel: '0412-271-79-50', mail: 'carlosluis6995@gmail.com',    foto: 'carlos-luis-mejias.jpg', pos: '50% 52%', q: 1,  r: -1 },
  { nombre: 'Genesis Garcia',     cargo: '', tel: '0414-318-81-71', mail: 'garciagenesis347@gmail.com',  foto: 'genesis-garcia.jpg',     pos: '50% 18%', q: 1,  r: 0  },
  { nombre: 'Daniel Guillory',    cargo: '', tel: '0412-242-86-03', mail: 'guillory123456@gmail.com',    foto: 'daniel-guillory.jpg',    pos: '50% 30%', q: 0,  r: 1  },
  { nombre: 'Yerson Alvarez',     cargo: '', tel: '0412-588-85-62', mail: 'sonyery.07@gmail.com',        foto: 'yerson-alvarez.jpg',     pos: '50% 28%', q: -1, r: 1  },
  { nombre: 'David Gonzalez',     cargo: '', tel: '0424-214-36-38', mail: 'gonzalezcada86@gmail.com',    foto: null,                     pos: '50% 50%', q: -1, r: 0  },
  // --- anillo exterior ---
  { nombre: 'Angelo Gomez',       cargo: '', tel: '0412-631-03-19', mail: 'angelogomez1703@gmail.com',   foto: 'angelo-gomez.jpg',       pos: '50% 28%', q: 0,  r: -2 },
  { nombre: 'Williams Veliz',     cargo: '', tel: '0412-369-56-07', mail: 'wavg87@gmail.com',            foto: null,                     pos: '50% 50%', q: 1,  r: -2 },
  { nombre: 'Juana Cabriles',     cargo: '', tel: '0424-163-08-06', mail: 'lcdajuanac@gmail.com',        foto: 'juana-cabriles.jpg',     pos: '50% 26%', q: 2,  r: -1 },
  { nombre: 'Jimmy Machado',      cargo: '', tel: '0412-424-65-32', mail: 'nanniegutierrez@gmail.com',   foto: null,                     pos: '50% 50%', q: 2,  r: 0  },
  { nombre: 'Victor Tachon',      cargo: '', tel: '0412-707-42-44', mail: 'corihernandez.2780@gmail.com',foto: 'victor-tachon.jpg',      pos: '50% 28%', q: 1,  r: 1  },
  { nombre: 'Pedro Millan',       cargo: '', tel: '0414-302-68-92', mail: 'arquitecto.millan@gmail.com', foto: 'pedro-millan.jpg',       pos: '50% 26%', q: 0,  r: 2  },
  { nombre: 'Virgilio Medilei',   cargo: '', tel: '0412-371-82-93', mail: 'vimerca0412@gmail.com',       foto: null,                     pos: '50% 50%', q: -1, r: 2  },
  { nombre: 'Yorbis Leal',        cargo: '', tel: '0414-186-47-39', mail: 'yorbisleal24@gmail.com',      foto: null,                     pos: '50% 50%', q: -2, r: 2  },
  { nombre: 'Gustavo Cisnero',    cargo: '', tel: '0424-209-22-79', mail: 'gacc2003@gmail.com',          foto: 'gustavo-cisnero.jpg',    pos: '50% 26%', q: -2, r: 1  },
  { nombre: 'Horacio Montero',    cargo: '', tel: '0414-313-21-47', mail: 'hrm976@gmail.com',            foto: null,                     pos: '50% 50%', q: -2, r: 0  },
  // Roselis Orama aparece en el documento con la MISMA fotografia de Kelin
  // Cardozo (verificado pixel a pixel). Hasta tener su foto real va con el
  // avatar generico: publicar la cara de otra persona bajo su nombre seria un error.
  { nombre: 'Roselis Orama',      cargo: '', tel: '0414-170-95-15', mail: 'roselysoramas@gmail.com',     foto: null,                     pos: '50% 50%', q: -1, r: -1 },
];

// Celda decorativa que completa el circulo del panal (esquina superior derecha).
export const DECORATIVA = { q: 2, r: -2 };
