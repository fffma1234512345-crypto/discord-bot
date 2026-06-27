import { SlashCommandBuilder } from "discord.js";

export const faqCommand = new SlashCommandBuilder()
  .setName("faq")
  .setDescription("الأسئلة الشائعة")
  .addSubcommand((sub) =>
    sub.setName("list").setDescription("عرض جميع الأسئلة الشائعة")
  )
  .addSubcommand((sub) =>
    sub
      .setName("show")
      .setDescription("عرض إجابة سؤال محدد")
      .addStringOption((opt) =>
        opt
          .setName("question")
          .setDescription("رقم السؤال أو الكلمة المفتاحية")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("add")
      .setDescription("إضافة سؤال شائع جديد (للإدارة فقط)")
      .addStringOption((opt) =>
        opt.setName("question").setDescription("السؤال").setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName("answer").setDescription("الإجابة").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("remove")
      .setDescription("حذف سؤال شائع (للإدارة فقط)")
      .addIntegerOption((opt) =>
        opt.setName("id").setDescription("رقم السؤال").setRequired(true)
      )
  );
