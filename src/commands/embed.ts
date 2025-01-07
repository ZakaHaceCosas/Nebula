import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandOptionsOnlyBuilder,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";
import { errorEmbed } from "../utils/embeds/errorEmbed";

export default class Embed {
  data: SlashCommandOptionsOnlyBuilder;

  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("embed")
      .setDescription("Create a custom embed message")
      .addStringOption(option =>
        option
          .setName("title")
          .setDescription("The title of the embed")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("description")
          .setDescription("The description of the embed")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("color")
          .setDescription("The color of the embed (hex code)")
      )
      .addStringOption(option =>
        option.setName("footer").setDescription("The footer text of the embed")
      )
      .addStringOption(option =>
        option.setName("image").setDescription("The URL of an image to add")
      )
      .addStringOption(option =>
        option.setName("thumbnail").setDescription("The URL of a thumbnail to add")
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages);
  }

  async run(interaction: ChatInputCommandInteraction) {
    const { guild, member } = interaction;
    if (!guild || !member) return;

    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description", true);
    const color = interaction.options.getString("color") || "#000000";
    const footer = interaction.options.getString("footer");
    const image = interaction.options.getString("image");
    const thumbnail = interaction.options.getString("thumbnail");

    try {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color as `#${string}`);

      if (footer) embed.setFooter({ text: footer });
      if (image) embed.setImage(image);
      if (thumbnail) embed.setThumbnail(thumbnail);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      return await errorEmbed(
        interaction,
        "Invalid embed parameters",
        "One or more of your inputs were invalid. Make sure image/thumbnail URLs are valid."
      );
    }
  }
}