import {
  AutocompleteInteraction,
  EmbedBuilder,
  InteractionType,
  PermissionsBitField,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../utils/colorGen";
import {
  getSetting,
  setSetting,
  settingsDefinition,
  settingsKeys
} from "../utils/database/settings";
import { errorEmbed } from "../utils/embeds/errorEmbed";

export default class Settings {
  data: SlashCommandBuilder;
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("settings")
      .setDescription("Configure Sokora to your liking.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

    settingsKeys.forEach(key => {
      const subcommand = new SlashCommandSubcommandBuilder()
        .setName(key)
        .setDescription(settingsDefinition[key].description);

      Object.keys(settingsDefinition[key].settings).forEach(sub => {
        switch (settingsDefinition[key].settings[sub].type as string) {
          case "BOOL":
            subcommand.addBooleanOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
          case "INTEGER":
            subcommand.addIntegerOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
          case "CHANNEL":
            subcommand.addChannelOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
          case "USER":
            subcommand.addUserOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
          case "ROLE":
            subcommand.addRoleOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
          default: // Also includes "TEXT"
            subcommand.addStringOption(option =>
              option
                .setName(sub)
                .setDescription(settingsDefinition[key].settings[sub]["desc"])
                .setRequired(false)
            );
            break;
        }
      });
      this.data.addSubcommand(subcommand);
    });
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    if (!guild.members.cache?.get(interaction.user.id)?.permissions.has("Administrator"))
      return await errorEmbed(
        interaction,
        "You can't execute this command.",
        "You need the **Administrator** permission."
      );

    const key = interaction.options.getSubcommand() as keyof typeof settingsDefinition;
    const values = interaction.options.data[0].options!;
    const settingsDef = settingsDefinition[key];
    function settingText(name: string) {
      const setting = getSetting(guild.id, key, name)?.toString();
      let text;
      switch (settingsDef.settings[name].type) {
        case "CHANNEL":
          text = setting ? `<#${setting}>` : "Not set";
          break;
        case "USER":
          text = setting ? `<@${setting}>` : "Not set";
          break;
        case "ROLE":
          text = setting ? `<@&${setting}>` : "Not set";
          break;
        default:
          text = setting || "Not set";
          break;
      }
      return text;
    }

    if (!values.length) {
      const field: string[] = [];
      Object.keys(settingsDef.settings).forEach(name =>
        field.push(`**${name}**: ${settingText(name)}`)
      );

      const embed = new EmbedBuilder()
        .setAuthor({ name: `Settings of ${key}` })
        .setDescription(`${settingsDef.description}`)
        .addFields({ name: "🧑‍🔧 • Settings", value: field.join("\n") })
        .setColor(genColor(100));

      return await interaction.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Parameters changed." })
      .setColor(genColor(100));

    values.forEach(async option => {
      if (option.type == 7)
        if (
          !guild.channels.cache
            .get(option.value as string)
            ?.permissionsFor(interaction.client.user)
            ?.has("ViewChannel")
        )
          return await errorEmbed(
            interaction,
            "Can't view this channel.",
            "You can either give the **View Channel** permission for Sokora or use a channel from the dropdown menu."
          );

      setSetting(guild.id, key, option.name, option.value as string);
      embed.addFields({
        name: option.name,
        value: settingText(option.name.toString()!)
      });
    });

    await interaction.reply({ embeds: [embed] });
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    if (interaction.type != InteractionType.ApplicationCommandAutocomplete) return;
    switch (Object.keys(settingsDefinition[interaction.options.getSubcommand()])[0]) {
      case "BOOL":
        await interaction.respond(
          ["true", "false"].map(choice => ({
            name: choice,
            value: choice
          }))
        );
        break;
      default:
        await interaction.respond([]);
    }
  }
}
