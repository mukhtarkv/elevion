const MAILGUN_API_KEY = "secret";
const MAILGUN_DOMAIN = "secret";
const MAILGUN_FROM = "secret";

interface EmailInvitation {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  inviteLink: string;
}

export const sendEventInvitation = async (
  invitation: EmailInvitation,
): Promise<{ success: boolean; message: string }> => {
  const { to, name, eventTitle, eventDate, eventTime, inviteLink } = invitation;

  const subject = `You're invited: ${eventTitle}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #3b82f6 50%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>

          <p>You've been invited to an exclusive event:</p>

          <h2 style="color: #f97316; margin: 24px 0 16px;">${eventTitle}</h2>

          <div class="details">
            <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
            <p style="margin: 8px 0;"><strong>⏰ Time:</strong> ${eventTime}</p>
          </div>

          <p>Before the event, chat with our virtual host to learn more about zerohouse, our culture, and what makes this community special.</p>

          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">View Invitation & RSVP</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Click the button above to confirm your attendance and start chatting with our AI assistant who can answer any questions you have about the event.
          </p>
        </div>
        <div class="footer">
          <p>zerohouse - Korea's first real silicon valley style founders space</p>
          <p style="font-size: 12px; margin-top: 12px;">If you have any questions, feel free to reach out to us.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${name},

You've been invited to: ${eventTitle}

📅 Date: ${eventDate}
⏰ Time: ${eventTime}

View your invitation and RSVP: ${inviteLink}

Before the event, chat with our virtual host to learn more about zerohouse, our culture, and what makes this community special.

---
zerohouse - Korea's first real silicon valley style founders space
  `.trim();

  try {
    const formData = new FormData();
    formData.append("from", MAILGUN_FROM);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", textContent);
    formData.append("html", htmlContent);

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`api:${MAILGUN_API_KEY}`),
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return {
      success: true,
      message: "Invitation sent successfully!",
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};
