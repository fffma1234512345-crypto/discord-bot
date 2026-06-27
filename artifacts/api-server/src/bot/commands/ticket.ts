import { SlashCommandBuilder } from "discord.js";

export const ticketCommand = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("نظام التذاكر")
  .addSubcommand((sub) =>
    sub.setName("setup").setDescription("إعداد نظام التذاكر في هذه القناة")
  )
  .addSubcommand((sub) =>
    sub.setName("close").setDescription("إغلاق التذكرة الحالية")
  )
  .addSubcommand((sub) =>
    sub.setName("add").setDescription("إضافة عضو للتذكرة").addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد إضافته").setRequired(true)
    )
  )
  .addSubcommand((sub) =>
    sub.setName("remove").setDescription("إزالة عضو من التذكرة").addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد إزالته").setRequired(true)
    )
  );
