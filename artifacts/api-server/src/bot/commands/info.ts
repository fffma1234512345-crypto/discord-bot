import { SlashCommandBuilder } from "discord.js";

export const infoCommands = [
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("عرض معلومات السيرفر"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("عرض معلومات عضو")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو (اتركه فارغاً لمعلوماتك أنت)")
    ),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("عرض معلومات البوت"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("فحص سرعة استجابة البوت"),
];
