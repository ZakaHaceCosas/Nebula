import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { genColor } from "../utils/colorGen";
import { imageColor } from "../utils/imageColor";
import { randomise } from "../utils/randomise";

export default class Credits {
  data: SlashCommandBuilder;
  constructor() {
    this.data = new SlashCommandBuilder()
      .setName("credits")
      .setDescription("Shows everyone who worked on Sokora.");
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
      .setAuthor({ name: "•  Credits", iconURL: avatar })
      .setFields({
        name: "🌌 • Entities involved",
        value: [
          "**Founder**: Goos",
          "**Developers**: Dimkauzh, Froxcey, Golem64, Koslz, MQuery, Nikkerudon, Spectrum, ThatBOI",
          "**Designers**: ArtyH, ZakaHaceCosas, Pjanda",
          "**Translator Lead**: ThatBOI",
          "**Translators**: Dimkauzh, flojo, Golem64, GraczNet, Nikkerudon, ZakaHaceCosas, SaFire, TrulyBlue",
          "**Testers**: Blaze, fishy, Trynera",
          "And **YOU**, for using Sokora."
        ].join("\n")
      })
      .setFooter({ text: `Made with ${randomise(emojis)} by the Sokora team` })
      .setThumbnail(avatar)
      .setColor(user.hexAccentColor ?? (await imageColor(undefined, avatar)) ?? genColor(270));

    await interaction.reply({ embeds: [embed] });
  }
}
