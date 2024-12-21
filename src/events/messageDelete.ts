import { EmbedBuilder } from "discord.js";
import { genColor } from "../utils/colorGen";
import { getSetting } from "../utils/database/settings";
import { logChannel } from "../utils/logChannel";
import { Event } from "../utils/types";

export default (async function run(message) {
  const author = message.author!;
  if (author.bot) return;

  const guild = message.guild!;
  if (!getSetting(guild.id, "moderation", "log_messages")) return;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `•  ${author.displayName}'s message has been deleted.`,
      iconURL: author.displayAvatarURL()
    })
    .setDescription(`[Jump to message](${message.url})`)
    .addFields({
      name: "🗑️ • Deleted message",
      value: message.content!
    })
    .setFooter({ text: `User ID: ${author.id}` })
    .setColor(genColor(0));

  await logChannel(guild, embed);
} as Event<"messageDelete">);
