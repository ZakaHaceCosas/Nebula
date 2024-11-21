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
    const user = interaction.client.user;
    const avatar = user.displayAvatarURL();
    let emojis = ["💖", "💝", "💓", "💗", "💘", "💟", "💕", "💞"];
    if (Math.round(Math.random() * 100) <= 5) emojis = ["⌨️", "💻", "🖥️"];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "•  Entities involved", iconURL: avatar })
      .setDescription(
        [
          "**Founder**: Goos",
          "**Developers**: Dimkauzh, Froxcey, Golem64, Koslz, MQuery, Nikkerudon, Spectrum, ThatBOI",
          "**Designers**: ArtyH, ZakaHaceCosas, Pjanda",
          "**Translator Lead**: ThatBOI",
          "**Translators**: Dimkauzh, flojo, Golem64, GraczNet, Nikkerudon, ZakaHaceCosas, SaFire, TrulyBlue",
          "**Testers**: Blaze, fishy, Trynera"
        ].join("\n")
      )
      .setFooter({ text: `Made with ${randomise(emojis)} by the Sokora team` })
      .setThumbnail(avatar)
      .setColor(user.hexAccentColor ?? (await imageColor(undefined, avatar)) ?? genColor(270));

    await interaction.reply({ embeds: [embed] });
  }
}
