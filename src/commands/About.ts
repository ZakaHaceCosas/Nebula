import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../utils/colorGen";
import { imageColor } from "../utils/imageColor";
import { pluralOrNot } from "../utils/pluralOrNot";
import { randomise } from "../utils/randomise";

export default class About {
  data: SlashCommandBuilder;
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("about")
      .setDescription("Shows information about Sokora.");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const user = client.user;
    const guilds = client.guilds.cache;
    const members = guilds.map(guild => guild.memberCount).reduce((a, b) => a + b);
    const shards = client.shard?.count;
    const avatar = user.displayAvatarURL();
    let emojis = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];
    if (Math.round(Math.random() * 100) <= 5) emojis = ["⌨️", "💻", "🖥️"];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "•  About Sokora", iconURL: avatar })
      .setDescription(
        "Sokora is a multipurpose Discord bot that lets you manage your servers easily."
      )
      .setFields(
        {
          name: "📃 • General",
          value: [
            "Version **0.1.2**, *Kaishi*",
            `**${members}** ${pluralOrNot("member", members)} • **${guilds.size}** ${pluralOrNot("guild", guilds.size)} ${
              !shards ? "" : `• **${shards}** ${pluralOrNot("shard", shards)}`
            }`
          ].join("\n")
        },
        {
          name: "🔗 • Links",
          value: [
            "[Discord](https://discord.gg/c6C25P4BuY) • [GitHub](https://www.github.com/SokoraDesu) • [YouTube](https://www.youtube.com/@SokoraDesu) • [Instagram](https://instagram.com/NebulaTheBot) • [Mastodon](https://mastodon.online/@NebulaTheBot@mastodon.social) • [Matrix](https://matrix.to/#/#sokora:matrix.org) • [Revolt](https://rvlt.gg/28TS9aXy)",
            "Also, please read the [ToS](https://sokora.org/terms) and the [privacy policy](https://sokora.org/privacy)."
          ].join("\n")
        }
      )
      .setFooter({ text: `Made with ${randomise(emojis)} by the Sokora team` })
      .setThumbnail(avatar)
      .setColor(user.hexAccentColor ?? (await imageColor(undefined, avatar)) ?? genColor(270));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("• Vote")
        .setURL("https://top.gg/bot/873918300726394960/vote")
        .setEmoji("🗳️")
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel("•  Donate")
        .setURL("https://paypal.me/SokoraTheBot")
        .setEmoji("⭐")
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
