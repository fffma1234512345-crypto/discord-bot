import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const modCommands = [
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("حظر عضو من السيرفر")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد حظره").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("سبب الحظر")
    )
    .addIntegerOption((opt) =>
      opt.setName("days").setDescription("حذف رسائل كم يوم (0-7)").setMinValue(0).setMaxValue(7)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("طرد عضو من السيرفر")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد طرده").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("سبب الطرد")
    ),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("كتم عضو")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد كتمه").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("duration").setDescription("المدة بالدقائق").setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("سبب الكتم")
    ),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("رفع الكتم عن عضو")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد رفع الكتم عنه").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("تحذير عضو")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("العضو المراد تحذيره").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("سبب التحذير").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("حذف رسائل من القناة")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("عدد الرسائل (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((opt) =>
      opt.setName("user").setDescription("حذف رسائل عضو محدد فقط")
    ),
];
