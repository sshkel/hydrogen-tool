export const ORANGE = "#ED7D31";
export const BLUE = "#396AFF";
export const GREY = "#EBE9E9";
export const SAPPHIRE = "#25579A";
export const LIGHT_BLUE = "#2397F1";
export const TEAL = "#0DD4C7";
export const colors = [
  "#F17D23", // orange
  "#2397F1", // light blue
  "#0DD4C7", // teal
  "#577fc0", // dark blue
  "#74c8b0", // greenish
  "#F1E423", // yellow
  "#37a9ad0", // blackish
];

export function addAlpha(color: string, opacity: number) {
  // coerce values so ti is between 0 and 1.
  var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
