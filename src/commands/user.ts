import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { genColor } from "../utils/colorGen";
import { getLevel } from "../utils/database/leveling";
import { getSetting } from "../utils/database/settings";
import { errorEmbed } from "../utils/embeds/errorEmbed";
import { imageColor } from "../utils/imageColor";
import { pluralOrNot } from "../utils/pluralOrNot";

export const data = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Shows your (or another user's) info.")
  .addUserOption(user => user.setName("user").setDescription("Select the user."));

export async function run(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  const user = interaction.options.getUser("user") ?? interaction.user;
  const target = guild.members.cache.get(user.id);
  const avatar = target?.displayAvatarURL() ?? user.displayAvatarURL();
  const embedColor =
    (await target?.user.fetch())?.hexAccentColor ??
    (await imageColor(undefined, avatar)) ??
    genColor(200);

  let embed = new EmbedBuilder()
    .setAuthor({
      name: `${avatar ? "•  " : ""}${target?.nickname ?? user.displayName}`,
      iconURL: avatar,
    })
    .setFields({
      name: `<:discord:1266797021126459423> • Discord info`,
      value: [
        `Username is **${user.username}**`,
        `Display name is ${
          user.displayName == user.username ? "*not there*" : `**${user.displayName}**`
        }`,
        `Created on **<t:${Math.round(user.createdAt.valueOf() / 1000)}:D>**`,
      ].join("\n"),
    })
    .setFooter({ text: `User ID: ${user.id}` })
    .setThumbnail(avatar)
    .setColor(embedColor);

  await interaction.reply({ embeds: [embed] });

  if (!target) return;
  let serverInfo = [`Joined on **<t:${Math.round(target.joinedAt?.valueOf()! / 1000)}:D>**`];
  const guildRoles = guild.roles.cache.filter(role => target.roles.cache.has(role.id))!;
  const memberRoles = [...guildRoles].sort((role1, role2) => role2[1].position - role1[1].position);
  memberRoles.pop();
  const rolesLength = memberRoles.length;

  if (target.premiumSinceTimestamp)
    serverInfo.push(`Boosting since **<t:${target.premiumSinceTimestamp}:D>**`);

  if (memberRoles.length)
    serverInfo.push(
      `**${guildRoles.filter(role => target.roles.cache.has(role.id)).size! - 1}** ${pluralOrNot(
        "role",
        memberRoles.length,
      )} • ${memberRoles
        .slice(0, 3)
        .map(role => `<@&${role[1].id}>`)
        .join(", ")}${rolesLength > 3 ? ` and **${rolesLength - 3}** more` : ""}`,
    );

  embed.addFields({
    name: "📒 • Server info",
    value: serverInfo.join("\n"),
  });

  const enabled = getSetting(`${guild.id}`, "leveling", "enabled");
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("general")
      .setLabel("•  General")
      .setEmoji("📃")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("level")
      .setLabel("•  Level")
      .setEmoji("⚡")
      .setStyle(ButtonStyle.Primary),
  );
  row.components[0].setDisabled(true);
  const reply = await interaction.editReply({
    embeds: [embed],
    components: !user.bot ? (enabled ? [row] : []) : [],
  });

  if (!enabled && user.bot) return;
  const difficulty = getSetting(guild.id, "leveling", "difficulty") as number;
  const [level, xp] = getLevel(guild.id, target.id)!;
  const nextLevelXp = Math.floor(
    100 * difficulty * (level + 1) ** 2 - 80 * difficulty * level ** 2,
  )?.toLocaleString("en-US");

  const collector = reply.createMessageComponentCollector({ time: 30000 });
  collector.on("collect", async (i: ButtonInteraction) => {
    if (i.message.id != (await reply.fetch()).id)
      return await errorEmbed(
        i,
        "For some reason, this click would've caused the bot to error. Thankfully, this message right here prevents that.",
      );

    if (i.user.id != interaction.user.id)
      return await errorEmbed(i, "You aren't the person who executed this command.");

    collector.resetTimer({ time: 30000 });
    i.customId == "general"
      ? row.components[0].setDisabled(true)
      : row.components[1].setDisabled(true);

    const levelEmbed = new EmbedBuilder()
      .setAuthor({
        name: `•  ${target.nickname ?? user.displayName}`,
        iconURL: target.displayAvatarURL(),
      })
      .setFields({
        name: `⚡ • Level ${level}`,
        value: [
          `**${xp.toLocaleString("en-US")}/${nextLevelXp}** XP`,
          `The next level is **${level + 1}**`,
        ].join("\n"),
      })
      .setFooter({ text: `User ID: ${target.id}` })
      .setThumbnail(target.displayAvatarURL())
      .setColor(embedColor);

    switch (i.customId) {
      case "general":
        row.components[1].setDisabled(false);
        await i.update({ embeds: [embed], components: [row] });
        break;
      case "level":
        row.components[0].setDisabled(false);
        await i.update({ embeds: [levelEmbed], components: [row] });
        break;
    }
  });

  collector.on("end", async () => await interaction.editReply({ components: [] }));
}
