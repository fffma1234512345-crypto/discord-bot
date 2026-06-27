import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} from "discord.js";
import { logger } from "../lib/logger";
import { handleTicketInteraction, setupTicketSystem } from "./systems/tickets";
import { handleWelcome } from "./systems/welcome";
import { handleFAQ } from "./systems/faq";
import { ticketCommand } from "./commands/ticket";
import { faqCommand } from "./commands/faq";
import { modCommands } from "./commands/mod";
import { infoCommands } from "./commands/info";
import { handleModCommand } from "./systems/moderation";
import { handleInfoCommand } from "./systems/info";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const commands = new Collection<string, unknown>();

export async function startBot() {
  const token = process.env["DISCORD_TOKEN"];
  if (!token) {
    logger.error("DISCORD_TOKEN is not set");
    return;
  }

  const allCommands = [ticketCommand, faqCommand, ...modCommands, ...infoCommands];

  client.once("ready", async (c) => {
    logger.info({ tag: c.user.tag }, "Bot is online!");

    for (const guild of c.guilds.cache.values()) {
      try {
        const rest = new REST().setToken(token);
        await rest.put(Routes.applicationGuildCommands(c.user.id, guild.id), {
          body: allCommands.map((cmd) => cmd.toJSON()),
        });
        logger.info({ guild: guild.name }, "Registered slash commands");

        await setupTicketSystem(client, guild);
      } catch (err) {
        logger.error({ err, guild: guild.name }, "Failed to setup guild");
      }
    }
  });

  client.on("guildCreate", async (guild) => {
    try {
      const rest = new REST().setToken(token);
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, guild.id),
        { body: allCommands.map((cmd) => cmd.toJSON()) }
      );
      await setupTicketSystem(client, guild);
      logger.info({ guild: guild.name }, "Joined new guild and set up");
    } catch (err) {
      logger.error({ err }, "Failed to set up new guild");
    }
  });

  client.on("guildMemberAdd", async (member) => {
    try {
      await handleWelcome(member);
    } catch (err) {
      logger.error({ err }, "Error in welcome handler");
    }
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    try {
      await handleFAQ(message);
    } catch (err) {
      logger.error({ err }, "Error in FAQ handler");
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const cmdName = interaction.commandName;

        if (cmdName === "ticket") {
          await handleTicketInteraction(interaction);
        } else if (cmdName === "faq") {
          const { handleFAQCommand } = await import("./systems/faq");
          await handleFAQCommand(interaction);
        } else if (["ban", "kick", "mute", "unmute", "warn", "clear"].includes(cmdName)) {
          await handleModCommand(interaction);
        } else if (["serverinfo", "userinfo", "botinfo", "ping"].includes(cmdName)) {
          await handleInfoCommand(interaction);
        }
      } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        await handleTicketInteraction(interaction as Parameters<typeof handleTicketInteraction>[0]);
      }
    } catch (err) {
      logger.error({ err }, "Error handling interaction");
    }
  });

  await client.login(token);
}
