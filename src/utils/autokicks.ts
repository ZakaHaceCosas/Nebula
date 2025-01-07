import { Client, EmbedBuilder, Guild, GuildMember } from "discord.js";
import { getAllAutokicks, getAutokickData } from "../utils/database/autokick";
import { logChannel } from "../utils/logChannel";
import { genColor } from "../utils/colorGen";

export async function checkAutokicks(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    const allAutokicks = getAllAutokicks(guild.id);

    for (const autokick of allAutokicks) {
      try {
        const member = await guild.members.fetch(autokick.user as string).catch(() => null);
        if (!member) continue;

        const lastMessage = new Date(autokick.last_message as string).getTime();
        const delay = (autokick.delay as number) * 24 * 60 * 60 * 1000; // Convert days to ms
        const now = Date.now();

        if (now - lastMessage >= delay) {
          await handleAutokick(guild, member, autokick.delay as number);
        }
      } catch (error) {
        console.error(`Error processing autokick for user ${autokick.user} in guild ${guild.id}:`, error);
      }
    }
  }
}

async function handleAutokick(guild: Guild, member: GuildMember, days: number): Promise<void> {
  try {
    await member.kick(`Inactive for ${days} days`);

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Member Auto-kicked" })
      .setDescription([
        `**Member**: ${member.user.tag}`,
        `**Reason**: Inactive for ${days} days`,
        `**Last Active**: <t:${Math.floor(Date.now() / 1000)}:F>`
      ].join("\n"))
      .setColor(genColor(100));

    await logChannel(guild, embed);
  } catch (error) {
    console.error(`Failed to auto-kick member ${member.id} from guild ${guild.id}:`, error);
  }
}