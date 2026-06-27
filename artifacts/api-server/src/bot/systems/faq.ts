import {
  Message,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "كيف أفتح تذكرة دعم؟",
    answer:
      "روح على قناة الدعم واضغط على زر **فتح تذكرة** 🎫 وحدد نوع مشكلتك، وسيتم إنشاء قناة خاصة بك.",
    keywords: ["تذكرة", "دعم", "مشكلة", "مساعدة", "ticket"],
  },
  {
    id: 2,
    question: "كيف أحصل على رتبة؟",
    answer:
      "الرتب تُمنح تلقائياً عند انضمامك للسيرفر، وبعضها يمنحها الإدارة بناءً على نشاطك ومساهمتك.",
    keywords: ["رتبة", "role", "رول"],
  },
  {
    id: 3,
    question: "ما هي قوانين السيرفر؟",
    answer:
      "راجع قناة القوانين للاطلاع على جميع القواعد. ملخص: احترام الجميع، عدم السبام، عدم نشر محتوى مسيء.",
    keywords: ["قانون", "قوانين", "rules", "القواعد", "ممنوع"],
  },
  {
    id: 4,
    question: "كيف أتواصل مع الإدارة؟",
    answer:
      "يمكنك فتح تذكرة دعم أو إرسال رسالة خاصة لأحد المشرفين المتاحين.",
    keywords: ["ادارة", "مشرف", "admin", "staff", "تواصل"],
  },
  {
    id: 5,
    question: "هل يمكنني الإبلاغ عن عضو؟",
    answer:
      "نعم! افتح تذكرة من نوع **بلاغ** 🚨 واشرح المشكلة مع إرفاق أي أدلة (screenshots).",
    keywords: ["بلاغ", "report", "إبلاغ", "شكوى"],
  },
];

let customFAQ: FAQItem[] = [];
let nextId = faqData.length + 1;

export async function handleFAQ(message: Message) {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const allFAQ = [...faqData, ...customFAQ];

  const match = allFAQ.find((item) =>
    item.keywords.some((kw) => content.includes(kw.toLowerCase()))
  );

  if (!match) return;

  const embed = new EmbedBuilder()
    .setTitle(`❓ ${match.question}`)
    .setDescription(match.answer)
    .setColor(0x5865f2)
    .setFooter({ text: `للمزيد من الأسئلة اكتب /faq list` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleFAQCommand(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const allFAQ = [...faqData, ...customFAQ];

  if (sub === "list") {
    const embed = new EmbedBuilder()
      .setTitle("📚 الأسئلة الشائعة")
      .setDescription(
        allFAQ
          .map((item) => `**${item.id}.** ${item.question}`)
          .join("\n\n")
      )
      .setColor(0x5865f2)
      .setFooter({ text: "استخدم /faq show [رقم] لرؤية الإجابة" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (sub === "show") {
    const query = interaction.options.getString("question", true);
    const item =
      allFAQ.find((f) => f.id === parseInt(query)) ??
      allFAQ.find((f) =>
        f.question.toLowerCase().includes(query.toLowerCase()) ||
        f.keywords.some((k) => k.includes(query.toLowerCase()))
      );

    if (!item) {
      await interaction.reply({
        content: "❌ لم أجد هذا السؤال. جرّب `/faq list` لرؤية جميع الأسئلة.",
        flags: 64,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`❓ ${item.question}`)
      .setDescription(item.answer)
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } else if (sub === "add") {
    const member = interaction.member as import("discord.js").GuildMember;
    if (!member.permissions.has("ManageGuild")) {
      await interaction.reply({ content: "❌ ليس لديك صلاحية لإضافة أسئلة!", flags: 64 });
      return;
    }

    const question = interaction.options.getString("question", true);
    const answer = interaction.options.getString("answer", true);
    const keywords = question.toLowerCase().split(" ").filter((w) => w.length > 2);

    customFAQ.push({ id: nextId++, question, answer, keywords });

    await interaction.reply({
      content: `✅ تم إضافة السؤال: **${question}**`,
      flags: 64,
    });
  } else if (sub === "remove") {
    const member = interaction.member as import("discord.js").GuildMember;
    if (!member.permissions.has("ManageGuild")) {
      await interaction.reply({ content: "❌ ليس لديك صلاحية لحذف أسئلة!", flags: 64 });
      return;
    }

    const id = interaction.options.getInteger("id", true);
    const idx = customFAQ.findIndex((f) => f.id === id);
    if (idx === -1) {
      await interaction.reply({ content: "❌ لم أجد سؤالاً بهذا الرقم في الأسئلة المخصصة.", flags: 64 });
      return;
    }

    customFAQ.splice(idx, 1);
    await interaction.reply({ content: `✅ تم حذف السؤال رقم ${id}.`, flags: 64 });
  }
}
