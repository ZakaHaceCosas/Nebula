import type { EmbedBuilder } from "discord.js";

export function replace(
  text: string,
  replaceText: { text: string; replacement: any }[],
  embed?: EmbedBuilder
) {
  for (const mention of replaceText)
    if (text?.includes(mention.text)) text = text.replaceAll(mention.text, mention.replacement);

  if (embed) return embed.setDescription(text);
  return text;
}
