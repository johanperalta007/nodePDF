// Script temporal reutilizable para sumar/restar valores X o Y en un rango de
// líneas de structureME.json, preservando el formato original del archivo.
// Editar DELTA_X, DELTA_Y, START_LINE y END_LINE según lo que se necesite,
// luego ejecutar con: node .tmp_shift.mjs
// Al terminar todo el desarrollo, borrar este archivo.

import fs from 'fs';

const filePath = new URL('./structureME.json', import.meta.url);
const raw = fs.readFileSync(filePath, 'utf8');
const lines = raw.split('\n');

// --- CONFIGURAR AQUÍ ANTES DE CADA EJECUCIÓN ---
const DELTA_X = 0;   // cuánto sumar/restar a la coordenada X (0 = no tocar X)
const DELTA_Y = -40; // cuánto sumar/restar a la coordenada Y (0 = no tocar Y)
const START_LINE = 141; // 1-indexed, inclusive
const END_LINE = 197;   // 1-indexed, inclusive
// -------------------------------------------------

// Índices dentro del array donde viven X e Y para cada clave.
// text-like: ["valor", x, y, {opciones}]  -> X en índice 1, Y en índice 2
// point-like (positions): [x, y, w, h]     -> X en índice 0, Y en índice 1
// point-like (line/move): [x, y]           -> X en índice 0, Y en índice 1
const keyIndex = {
  text:     { x: 1, y: 2 },
  text2:    { x: 1, y: 2 },
  text3:    { x: 1, y: 2 },
  text4:    { x: 1, y: 2 },
  text5:    { x: 1, y: 2 },
  params:   { x: 1, y: 2 },
  positions:{ x: 0, y: 1 },
  line:     { x: 0, y: 1 },
  move:     { x: 0, y: 1 },
};

function splitTopLevel(content) {
  const parts = [];
  let depth = 0;
  let inString = false;
  let current = '';
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inString) {
      current += ch;
      if (ch === '\\') { current += content[++i]; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; current += ch; }
    else if (ch === '[' || ch === '{') { depth++; current += ch; }
    else if (ch === ']' || ch === '}') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { parts.push(current); current = ''; }
    else { current += ch; }
  }
  parts.push(current);
  return parts;
}

function findMatchingBracket(text, openIdx) {
  let depth = 0;
  let inString = false;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) return i; }
  }
  throw new Error('No matching bracket');
}

function shiftLine(lineText) {
  let result = '';
  let cursor = 0;
  let modified = 0;
  const keyPattern = /"(text5|text4|text3|text2|text|params|positions|line|move)":\[/g;
  let match;
  while ((match = keyPattern.exec(lineText)) !== null) {
    const key = match[1];
    const openBracketIdx = match.index + match[0].length - 1;
    const closeBracketIdx = findMatchingBracket(lineText, openBracketIdx);
    result += lineText.slice(cursor, openBracketIdx + 1);
    const inner = lineText.slice(openBracketIdx + 1, closeBracketIdx);
    const parts = splitTopLevel(inner);
    const idx = keyIndex[key];

    if (DELTA_X !== 0 && parts[idx.x] !== undefined && /^-?\d+(\.\d+)?$/.test(parts[idx.x].trim())) {
      parts[idx.x] = String(parseFloat(parts[idx.x]) + DELTA_X);
      modified++;
    }
    if (DELTA_Y !== 0 && parts[idx.y] !== undefined && /^-?\d+(\.\d+)?$/.test(parts[idx.y].trim())) {
      parts[idx.y] = String(parseFloat(parts[idx.y]) + DELTA_Y);
      modified++;
    }

    result += parts.join(',');
    result += ']';
    cursor = closeBracketIdx + 1;
    keyPattern.lastIndex = cursor;
  }
  result += lineText.slice(cursor);
  return { result, modified };
}

let totalModified = 0;
for (let i = START_LINE - 1; i <= END_LINE - 1; i++) {
  if (i < 0 || i >= lines.length) continue;
  const { result, modified } = shiftLine(lines[i]);
  lines[i] = result;
  totalModified += modified;
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Modificadas: ' + totalModified);
