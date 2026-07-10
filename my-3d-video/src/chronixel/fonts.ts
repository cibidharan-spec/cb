// Poppins per the Text Style doc: headings are Poppins ExtraBold, very tight tracking.
// Vendored locally in public/fonts so renders don't depend on network font fetches.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const poppins = "Poppins";

const weights: Array<[string, string]> = [
  ["400", "fonts/poppins-400.woff2"],
  ["500", "fonts/poppins-500.woff2"],
  ["600", "fonts/poppins-600.woff2"],
  ["800", "fonts/poppins-800.woff2"],
];

weights.forEach(([weight, path]) => {
  loadFont({
    family: poppins,
    url: staticFile(path),
    weight,
    display: "block",
  });
});
