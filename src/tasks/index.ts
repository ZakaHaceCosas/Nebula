import { Client } from "discord.js";
import { checkAutokicks } from "./autokick";

export function initializeTasks(client: Client) {
  checkAutokicks(client);

  setInterval(() => checkAutokicks(client), 60 * 60 * 1000);
}