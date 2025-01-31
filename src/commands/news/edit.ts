import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ChatInputCommandInteraction,
  type Role,
  type TextChannel
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { get, updateNews } from "../../utils/database/news";
import { getSetting } from "../../utils/database/settings";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { sendChannelNews } from "../../utils/sendChannelNews";

export const data = new SlashCommandSubcommandBuilder()
  .setName("edit")
  .setDescription("Edits the news of your guild.")
  .addStringOption(string =>
    string.setName("id").setDescription("The ID of the news you want to edit.").setRequired(true)
  );

export async function run(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  if (!guild.members.cache.get(interaction.user.id)?.permissions.has("ManageGuild"))
    return await errorEmbed(
      interaction,
      "You can't execute this command.",
      "You need the **Manage Server** permission."
    );

  const id = interaction.options.getString("id")!;
  const news = get(guild.id, id);
  if (!news) return await errorEmbed(interaction, "The specified news don't exist.");

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setCustomId("title")
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setLabel("Title")
      .setValue(news.title)
      .setRequired(true)
  );

  const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder()
      .setCustomId("body")
      .setMaxLength(4000)
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Content (supports Markdown)")
      .setValue(news.body)
      .setRequired(true)
  );

  const editModal = new ModalBuilder()
    .setCustomId("editnews")
    .setTitle(`Edit news: ${news.title}`)
    .addComponents(firstActionRow, secondActionRow);

  await interaction.showModal(editModal).catch(err => console.error(err));
  interaction.client.once("interactionCreate", async i => {
    if (!i.isModalSubmit()) return;

    const role = getSetting(guild.id, "news", "role_id") as string;
    let roleToSend: Role | undefined;
    if (role) roleToSend = guild.roles.cache.get(role);
    const title = i.fields.getTextInputValue("title");
    const body = i.fields.getTextInputValue("body");

    if (!getSetting(guild.id, "news", "edit_original_message"))
      await sendChannelNews(guild, id, interaction, title, body);

    const embed = new EmbedBuilder()
      .setAuthor({ name: `•  ${news.author}`, iconURL: news.authorPFP })
      .setTitle(title)
      .setDescription(body)
      .setTimestamp(parseInt(news.updatedAt.toString()) ?? null)
      .setFooter({ text: `Edited news from ${guild.name}\nID: ${news.id}` })
      .setColor(genColor(200));

    (
      guild.channels.cache.get(
        (getSetting(guild.id, "news", "channel_id") as string) ?? interaction.channel?.id
      ) as TextChannel
    )?.messages.edit(news.messageID, {
      embeds: [embed],
      content: roleToSend ? `<@&${roleToSend.id}>` : undefined
    });

    updateNews(guild.id, id, title, body);
    await i.reply({
      embeds: [new EmbedBuilder().setTitle("News edited.").setColor(genColor(100))],
      flags: MessageFlags.Ephemeral
    });
  });
}
