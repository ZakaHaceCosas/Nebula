import { ActivityType, Client } from "discord.js";
import { registerCommands } from "./handlers/commands";
import { loadEvents } from "./handlers/events";
import { rescheduleUnbans } from "./utils/unbanScheduler";

const client = new Client({
  presence: {
    activities: [{ name: "your feedback!", type: ActivityType.Listening }]
  },
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "GuildEmojisAndStickers",
    "GuildBans",
    "MessageContent"
  ]
});

client.on("ready", async () => {
  await loadEvents(client);
  await registerCommands(client);
  console.log("ちーっす！");
  rescheduleUnbans(client);
});

client.login(process.env.TOKEN);
