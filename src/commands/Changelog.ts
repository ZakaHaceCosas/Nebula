import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { version } from "../../package.json";
import { genColor } from "../utils/colorGen";
import { imageColor } from "../utils/imageColor";
import { replace } from "../utils/replace";

export default class Changelog {
  data: SlashCommandBuilder;
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("changelog")
      .setDescription("Shows the changelog of Sokora's most recent update.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.client.user;
    const avatar = user.displayAvatarURL();
    const text = [
      ["## Added", "### Commands", "- /changelog", "- /credits", "- /moderation notes"].join("\n"),
      [
        "## Changed",
        "- The bot will remove levels when an admin changed the leveling difficulty",
        "- /leaderboard shows 6 users per page instead of 5",
        "- When you add the bot, it sends a message in the system channel",
        "- Remade the message logs",
        "  - Edit logs will let you jump to the message that got edited"
      ].join("\n"),
      [
        "### /settings",
        "- Autocompletes with channels/users/roles (you don't have to copy IDs now :tada:)",
        "- In the embed it will show links to channels/users/roles instead of showing IDs"
      ].join("\n"),
      [
        "### /about",
        "- Vote button added",
        "- Removed credits and put them in a different command to reduce the height of the embed"
      ].join("\n"),
      [
        "## Fixed",
        "### News",
        "- Major issue related to the database, where the guild wasn't provided to ensure that news would be unique to every server, **thank you @Golem642!!!!**",
        "- /news edit's modal errored when sending"
      ].join("\n"),
      [
        "### Moderation commands",
        "- /moderation clear removed one more message than the user provided",
        '- /moderation unban errored internally (it should send an error embed) when the user didn\'t have the "Ban Members" permission'
      ].join("\n"),
      [
        "## Typos",
        '- "warn" mentions in /moderation warn are now "warning" to be more consistent',
        "- Removed old markdown remnants from /moderation slowdown"
      ].join("\n")
    ].join("\n");

    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  Changelog for ${version}`, iconURL: avatar })
      .setDescription(text)
      .setFooter({ text: replace("(madeWith)") })
      .setThumbnail(avatar)
      .setColor(user.hexAccentColor ?? (await imageColor(undefined, avatar)) ?? genColor(270));

    await interaction.reply({ embeds: [embed] });
  }
}
