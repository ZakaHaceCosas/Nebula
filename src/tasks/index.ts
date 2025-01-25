import { Client } from "discord.js";
import { checkAutokicks } from "./autokick";

export async function initializeTasks(client: Client) {
  await checkAutokicks(client);
  setInterval(() => checkAutokicks(client), 60 * 60 * 1000);
}
