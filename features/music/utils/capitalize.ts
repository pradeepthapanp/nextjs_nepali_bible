/**
 * capitalizeWords — a direct port of the Flutter `capitalizeWords` extension
 * (`lib/helpers/capitalize_extension.dart`), used to render song/artist
 * category labels ("bhajan" → "Bhajan").
 *
 * Pure, framework-free. Note: the rest of each word is lowercased, exactly
 * like Flutter ("BHAAJAN" → "Bhajan").
 */
export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
