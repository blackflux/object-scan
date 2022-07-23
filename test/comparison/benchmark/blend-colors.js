export default (colorA, colorB, amount) => {
  const [rA, gA, bA] = colorA.match(/[^#]{2}/g).map((c) => parseInt(c, 16));
  const [rB, gB, bB] = colorB.match(/[^#]{2}/g).map((c) => parseInt(c, 16));
  const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
  const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
  const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};
