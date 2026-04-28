import nodemailer from 'nodemailer';

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
): Promise<void> {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from =
    process.env.SMTP_FROM?.trim() || `"Инвестиционный портфель" <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: 'Сброс пароля',
    text: `Здравствуйте.\n\nЧтобы задать новый пароль, перейдите по ссылке (она действует 1 час):\n${resetLink}\n\nЕсли вы не запрашивали сброс, проигнорируйте это письмо.`,
    html: `<p>Чтобы задать новый пароль, перейдите по ссылке (она действует <strong>1 час</strong>):</p><p><a href="${resetLink}">${resetLink}</a></p><p>Если вы не запрашивали сброс, проигнорируйте это письмо.</p>`,
  });
}
