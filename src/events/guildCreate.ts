import { EmbedBuilder, type DMChannel } from "discord.js";
import { commands } from "../handlers/commands";
import { genColor } from "../utils/colorGen";
import { randomise } from "../utils/randomise";
import { Event } from "../utils/types";

export default (async function run(guild) {
  const owner = await guild.fetchOwner();
  if (owner.user.bot) return;

  const dmChannel = (await owner.createDM().catch(() => null)) as DMChannel | undefined;
  let emojis = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];
  if (Math.round(Math.random() * 100) <= 5) emojis = ["⌨️", "💻", "🖥️"];

  const client = guild.client;
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Welcome to ${client.user.username}!`,
      iconURL: client.user.displayAvatarURL()
    })
    .setDescription(
      [
        "Sokora is a multipurpose Discord bot that lets you manage your servers easily.",
        "To manage the bot, use the **/settings** command.\n",
        "Sokora is in an early stage of development. If you find bugs, please go to our [official server](https://discord.gg/c6C25P4BuY) and report them."
      ].join("\n")
    )
    .setFooter({ text: `Made with ${randomise(emojis)} by the Sokora team` })
    .setThumbnail(client.user.displayAvatarURL())
    .setColor(genColor(200));

  await guild.commands.set(commands.map(command => command.data));
  try {
    if (dmChannel) await dmChannel.send({ embeds: [embed] });
  } catch (e) {
    console.log(e);
  }
} as Event<"guildCreate">);
