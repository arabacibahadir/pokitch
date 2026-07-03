const SPRITE_BASE_URL = "https://projectpokemon.org/images/normal-sprite";

export function getPokemonSpriteUrl(name: string) {
  return `${SPRITE_BASE_URL}/${encodeURIComponent(name)}.gif`;
}

export function formatCatchDate(value: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}
