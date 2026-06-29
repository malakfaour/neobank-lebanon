import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
    provider = settings.EMAIL_PROVIDER.lower()

    if provider == "console":
        logger.info("Console email provider enabled.")
        logger.info("To: %s", to_email)
        logger.info("From: %s", settings.EMAIL_FROM)
        logger.info("Subject: %s", subject)
        logger.info("Body: %s", body)
        return

    if provider == "smtp":
        _send_email_smtp(
            to_email=to_email,
            subject=subject,
            body=body,
            html_body=html_body,
        )
        return

    if provider == "sendgrid":
        logger.info("SendGrid provider configured. Week 1 behavior: console log only.")
        logger.info("To: %s", to_email)
        logger.info("From: %s", settings.EMAIL_FROM)
        logger.info("Subject: %s", subject)
        logger.info("Body: %s", body)
        return

    logger.warning("Unknown EMAIL_PROVIDER=%s. Email was not sent.", provider)


def _send_email_smtp(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
    if not settings.SMTP_HOST:
        raise ValueError("SMTP_HOST is required when EMAIL_PROVIDER=smtp")

    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    if html_body:
        message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()

        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

        server.send_message(message)


def send_welcome_email(to_email: str, full_name: str | None = None) -> None:
    display_name = full_name or "there"

    subject = "Welcome to NeoBank Lebanon"

    body = (
        f"Hello {display_name},\n\n"
        "Welcome to NeoBank Lebanon. Your account has been created successfully.\n\n"
        "You can now log in and start using your digital banking features.\n\n"
        "Best regards,\n"
        "NeoBank Lebanon Team"
    )

    html_body = f"""
    <html>
        <body>
            <p>Hello {display_name},</p>
            <p>Welcome to <strong>NeoBank Lebanon</strong>.</p>
            <p>Your account has been created successfully.</p>
            <p>You can now log in and start using your digital banking features.</p>
            <p>Best regards,<br>NeoBank Lebanon Team</p>
        </body>
    </html>
    """

    try:
        send_email(
            to_email=to_email,
            subject=subject,
            body=body,
            html_body=html_body,
        )
    except Exception:
        logger.exception("Failed to send welcome email to %s", to_email)