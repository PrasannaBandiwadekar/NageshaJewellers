using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace NageshaJewellers.API.Services
{
    // This class is responsible for ONE thing: sending emails.
    // We use Gmail's SMTP server here because it's free and simple to set
    // up - you just need a Gmail address and an "App Password" (explained
    // in the setup guide). For a real published business, you'd usually
    // switch this to a dedicated email service later (like SendGrid or
    // Amazon SES) for better deliverability at scale - but Gmail is a
    // perfectly good way to start.
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
        {
            var fromEmail = _config["Email:FromAddress"];
            var fromName = _config["Email:FromName"] ?? "Nagesha Jewellers";
            var appPassword = _config["Email:AppPassword"];
            var smtpHost = _config["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");

            // If email isn't configured yet, skip sending instead of crashing
            // the whole registration. We log a warning so it's easy to notice
            // during setup, but the customer's account still gets created.
            if (string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(appPassword)
                || appPassword == "REPLACE_WITH_YOUR_GMAIL_APP_PASSWORD")
            {
                _logger.LogWarning("Email is not configured yet (see appsettings.json 'Email' section). Skipped sending welcome email to {Email}.", toEmail);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(fullName, toEmail));
            message.Subject = "Welcome to Nagesha Jewellers!";

            message.Body = new TextPart("html")
            {
                Text = BuildWelcomeEmailHtml(fullName)
            };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(fromEmail, appPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // We deliberately don't let a failed email stop registration
                // from succeeding - the customer's account is more important
                // than the email. We just log it so you can investigate.
                _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
            }
        }

        // Sends the order confirmation/receipt email right after an order
        // is placed. Uses the same Gmail SMTP connection as the welcome
        // email above.
        public async Task SendOrderConfirmationEmailAsync(string toEmail, string fullName, OrderConfirmationDetails order)
        {
            var fromEmail = _config["Email:FromAddress"];
            var fromName = _config["Email:FromName"] ?? "Nagesha Jewellers";
            var appPassword = _config["Email:AppPassword"];
            var smtpHost = _config["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");

            if (string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(appPassword)
                || appPassword == "REPLACE_WITH_YOUR_GMAIL_APP_PASSWORD")
            {
                _logger.LogWarning("Email is not configured yet (see appsettings.json 'Email' section). Skipped sending order confirmation for {OrderNumber}.", order.OrderNumber);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(fullName, toEmail));
            message.Subject = $"Order Confirmed — {order.OrderNumber}";

            message.Body = new TextPart("html")
            {
                Text = BuildOrderConfirmationEmailHtml(fullName, order)
            };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(fromEmail, appPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Same approach as the welcome email: a failed email should
                // never undo or block the order itself. We just log it.
                _logger.LogError(ex, "Failed to send order confirmation email for {OrderNumber}", order.OrderNumber);
            }
        }

        private static string BuildWelcomeEmailHtml(string fullName)
        {
            // A simple, friendly HTML email. Inline CSS is used throughout
            // because most email apps (Gmail, Outlook) ignore <style> blocks
            // in the <head> - inline styles are the safe way to format emails.
            return $@"
<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2B231C;'>
    <h1 style='font-family: Georgia, serif; color: #2B231C; font-size: 24px; margin-bottom: 4px;'>Nagesha Jewellers</h1>
    <p style='color: #B8935F; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 0;'>Welcome</p>

    <p style='font-size: 16px; line-height: 1.6;'>Hi {fullName},</p>
    <p style='font-size: 16px; line-height: 1.6;'>
        Thank you for registering with <strong>Nagesha Jewellers</strong>! We're
        so glad to have you with us.
    </p>
    <p style='font-size: 16px; line-height: 1.6;'>
        You can now browse our collections, save your favourite pieces to
        your cart, and track your orders any time from your account.
    </p>

    <div style='background: #F3ECE2; border-radius: 6px; padding: 16px 20px; margin: 24px 0;'>
        <p style='margin: 0 0 8px 0; font-weight: bold; color: #9C7A47;'>Visit Our Store</p>
        <p style='margin: 0; font-size: 14px; line-height: 1.6;'>
            Nagesha Jewellers<br/>
            Opposite Ganapati Mandir, Main Road<br/>
            Shirol, Tal. Shirol<br/>
            Dist. Kolhapur, Maharashtra
        </p>
    </div>

    <p style='font-size: 16px; line-height: 1.6;'>
        If you have any questions, just reply to this email — we're happy to help.
    </p>

    <p style='font-size: 16px; line-height: 1.6; margin-top: 24px;'>
        Warmly,<br/>
        The Nagesha Jewellers Team
    </p>
</div>";
        }

        private static string BuildOrderConfirmationEmailHtml(string fullName, OrderConfirmationDetails order)
        {
            // Build the list of purchased items as HTML table rows
            var itemRowsHtml = string.Join("", order.Items.Select(item => $@"
                <tr>
                    <td style='padding: 8px 0; border-bottom: 1px solid #E2D9CC; font-size: 14px;'>{item.ProductName} &times; {item.Quantity}</td>
                    <td style='padding: 8px 0; border-bottom: 1px solid #E2D9CC; font-size: 14px; text-align: right;'>&#8377;{(item.UnitPrice * item.Quantity):N2}</td>
                </tr>"));

            return $@"
<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2B231C;'>
    <h1 style='font-family: Georgia, serif; color: #2B231C; font-size: 24px; margin-bottom: 4px;'>Nagesha Jewellers</h1>
    <p style='color: #B8935F; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 0;'>Order Confirmed</p>

    <p style='font-size: 16px; line-height: 1.6;'>Hi {fullName},</p>
    <p style='font-size: 16px; line-height: 1.6;'>
        Thank you for your order! We've received it and will get it ready for you soon.
    </p>

    <div style='background: #F3ECE2; border-radius: 6px; padding: 16px 20px; margin: 24px 0;'>
        <p style='margin: 0 0 4px 0; font-weight: bold; color: #9C7A47;'>Order Number</p>
        <p style='margin: 0 0 16px 0; font-size: 16px;'>{order.OrderNumber}</p>

        <table style='width: 100%; border-collapse: collapse;'>
            {itemRowsHtml}
            <tr>
                <td style='padding: 10px 0 0 0; font-weight: bold; font-size: 15px;'>Total</td>
                <td style='padding: 10px 0 0 0; font-weight: bold; font-size: 15px; text-align: right;'>&#8377;{order.TotalAmount:N2}</td>
            </tr>
        </table>
    </div>

    <div style='margin: 24px 0;'>
        <p style='margin: 0 0 4px 0; font-weight: bold; color: #9C7A47;'>Delivery Address</p>
        <p style='margin: 0; font-size: 14px; line-height: 1.6;'>
            {order.ShippingFullName}<br/>
            {order.ShippingLine1}{(string.IsNullOrWhiteSpace(order.ShippingLine2) ? "" : "<br/>" + order.ShippingLine2)}<br/>
            {order.ShippingCity}, {order.ShippingState} {order.ShippingPostalCode}<br/>
            Phone: {order.ShippingPhone}
        </p>
    </div>

    <div style='background: #FBF7F2; border: 1px solid #E2D9CC; border-radius: 6px; padding: 14px 18px; margin: 24px 0;'>
        <p style='margin: 0; font-size: 14px; line-height: 1.6;'>
            💰 <strong>Payment:</strong> Pay on Delivery — please keep
            &#8377;{order.TotalAmount:N2} ready (cash or as arranged) when your
            order arrives.
        </p>
    </div>

    <p style='font-size: 16px; line-height: 1.6;'>
        We'll let you know once your order has shipped. You can also check
        its status anytime from the <strong>My Orders</strong> page on our website.
    </p>

    <p style='font-size: 16px; line-height: 1.6;'>
        If you have any questions, just reply to this email — we're happy to help.
    </p>

    <p style='font-size: 16px; line-height: 1.6; margin-top: 24px;'>
        Warmly,<br/>
        The Nagesha Jewellers Team
    </p>
</div>";
        }
    }

    // Small plain data holder so OrdersController doesn't need to pass
    // a long list of separate parameters into the email method.
    public class OrderConfirmationDetails
    {
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string ShippingFullName { get; set; } = string.Empty;
        public string ShippingPhone { get; set; } = string.Empty;
        public string ShippingLine1 { get; set; } = string.Empty;
        public string? ShippingLine2 { get; set; }
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingState { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;
        public List<OrderConfirmationItem> Items { get; set; } = new();
    }

    public class OrderConfirmationItem
    {
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }
}
