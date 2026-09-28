<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

class Mailer {
    /**
     * Send Password Reset OTP via Gmail SMTP
     *
     * @param string $toEmail Customer's registered email
     * @param string $customerName Customer's name
     * @param string $otp 6-digit verification code
     * @return array ['success' => bool, 'message' => string]
     */
    public static function sendOtpEmail($toEmail, $customerName, $otp) {
        $config = require __DIR__ . '/mail_config.php';

        // Check if password or username is empty
        if (empty($config['smtp_password'])) {
            // If password is not yet configured, log and return informative message
            error_log("Mailer Warning: smtp_password is empty in mail_config.php. OTP generated: $otp");
            return [
                'success' => false,
                'is_config_missing' => true,
                'message' => 'Email service not configured. Please add your 16-digit Google App Password in BB backend/config/mail_config.php.'
            ];
        }

        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = $config['smtp_auth'];
            $mail->Username   = $config['smtp_username'];
            $mail->Password   = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)$config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            // Recipients
            $mail->setFrom($config['from_email'], $config['from_name']);
            $mail->addAddress($toEmail, $customerName ?: 'Valued Customer');
            $mail->addReplyTo($config['from_email'], $config['from_name']);

            // Email Content
            $mail->isHTML(true);
            $mail->Subject = "Your BigBite Password Reset Code: $otp";

            // HTML Body Template
            $safeName = htmlspecialchars($customerName ?: 'Foodie', ENT_QUOTES, 'UTF-8');
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset='utf-8'>
              <meta name='viewport' content='width=device-width, initial-scale=1.0'>
              <title>Password Reset Code</title>
            </head>
            <body style='margin:0; padding:0; background-color:#0f0f11; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color:#ffffff;'>
              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color:#0f0f11; padding:30px 15px;'>
                <tr>
                  <td align='center'>
                    <table role='presentation' width='100%' style='max-width:540px; background-color:#18181b; border:1px solid #27272a; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.5);' cellspacing='0' cellpadding='0' border='0'>
                      
                      <!-- Header -->
                      <tr>
                        <td style='background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding:30px 24px; text-align:center;'>
                          <h1 style='margin:0; font-size:28px; font-weight:900; letter-spacing:1px; color:#09090b; text-transform:uppercase;'>BIGBITE</h1>
                          <p style='margin:6px 0 0 0; font-size:13px; font-weight:600; color:#451a03;'>Instant Fast Food & Delicious Meals</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style='padding:36px 28px;'>
                          <h2 style='margin:0 0 12px 0; font-size:20px; font-weight:700; color:#ffffff;'>Password Reset Request</h2>
                          <p style='margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#a1a1aa;'>
                            Hello <strong style='color:#f4f4f5;'>$safeName</strong>,<br>
                            We received a request to reset your password. Use the 6-digit verification code below to set a new password:
                          </p>

                          <!-- OTP Code Box -->
                          <div style='background-color:#09090b; border:2px dashed #f59e0b; border-radius:16px; padding:20px; text-align:center; margin:28px 0;'>
                            <span style='font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#f59e0b; display:block; margin-bottom:8px;'>VERIFICATION CODE</span>
                            <span style='font-size:38px; font-weight:900; letter-spacing:8px; font-family:Courier, monospace; color:#ffffff;'>$otp</span>
                            <span style='font-size:11px; color:#71717a; display:block; margin-top:8px;'>Valid for 2 minutes</span>
                          </div>

                          <p style='margin:0 0 16px 0; font-size:13px; line-height:1.6; color:#71717a;'>
                            ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. BigBite representatives will never ask you for this code.
                          </p>

                          <p style='margin:0; font-size:12px; line-height:1.6; color:#52525b;'>
                            If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style='border-top:1px solid #27272a; padding:20px 24px; text-align:center; background-color:#121215;'>
                          <p style='margin:0; font-size:11px; color:#52525b;'>
                            &copy; " . date('Y') . " BigBite Delivery. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            ";

            // Plain text alternative
            $mail->AltBody = "Hello $safeName,\n\nYour BigBite password reset code is: $otp\n\nThis code will expire in 2 minutes. If you did not request this, please ignore this email.";

            $mail->send();
            return [
                'success' => true,
                'message' => 'Verification code sent to your email.'
            ];
        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            return [
                'success' => false,
                'message' => "Could not send email: {$mail->ErrorInfo}"
            ];
        }
    }

    /**
     * Send Password Reset OTP for Staff Portal
     *
     * @param string $toEmail Staff member's registered email
     * @param string $staffName Staff member's name
     * @param string $role Staff member's operational role
     * @param string $otp 6-digit verification code
     * @return array ['success' => bool, 'message' => string]
     */
    public static function sendStaffPasswordResetEmail($toEmail, $staffName, $role, $otp) {
        $config = require __DIR__ . '/mail_config.php';

        if (empty($config['smtp_password'])) {
            error_log("Mailer Warning: smtp_password is empty in mail_config.php. Staff Password Reset OTP generated: $otp for $toEmail");
            return [
                'success' => false,
                'is_config_missing' => true,
                'message' => 'Email service not configured. Please add your 16-digit Google App Password in BB backend/config/mail_config.php.'
            ];
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = $config['smtp_auth'];
            $mail->Username   = $config['smtp_username'];
            $mail->Password   = $config['smtp_password'];
            $mail->SMTPSecure = $config['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)$config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['from_email'], 'QuickiBite Staff Portal');
            $mail->addAddress($toEmail, $staffName ?: 'Staff Member');
            $mail->addReplyTo($config['from_email'], 'QuickiBite Admin Support');

            $mail->isHTML(true);
            $mail->Subject = "QuickiBite Staff - Password Reset Code: $otp";

            $safeName = htmlspecialchars($staffName ?: 'Team Member', ENT_QUOTES, 'UTF-8');
            $safeRole = strtoupper(htmlspecialchars($role ?: 'Staff', ENT_QUOTES, 'UTF-8'));

            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset='utf-8'>
              <meta name='viewport' content='width=device-width, initial-scale=1.0'>
              <title>Staff Password Reset Code</title>
            </head>
            <body style='margin:0; padding:0; background-color:#09090b; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color:#ffffff;'>
              <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color:#09090b; padding:30px 15px;'>
                <tr>
                  <td align='center'>
                    <table role='presentation' width='100%' style='max-width:540px; background-color:#18181b; border:1px solid #27272a; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.6);' cellspacing='0' cellpadding='0' border='0'>
                      
                      <!-- Header -->
                      <tr>
                        <td style='background:linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding:28px 24px; text-align:center;'>
                          <h1 style='margin:0; font-size:24px; font-weight:900; letter-spacing:1.5px; color:#09090b; text-transform:uppercase;'>QUICKIBITE STAFF</h1>
                          <p style='margin:4px 0 0 0; font-size:12px; font-weight:700; color:#431407; text-transform:uppercase; letter-spacing:1px;'>PASSWORD RESET SERVICE</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style='padding:32px 28px;'>
                          <div style='display:inline-block; background-color:#f59e0b20; border:1px solid #f59e0b50; border-radius:8px; padding:4px 12px; margin-bottom:16px;'>
                            <span style='font-size:11px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:1px;'>STAFF ROLE: $safeRole</span>
                          </div>

                          <h2 style='margin:0 0 10px 0; font-size:20px; font-weight:700; color:#ffffff;'>Password Reset Request</h2>
                          <p style='margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#a1a1aa;'>
                            Hello <strong style='color:#f4f4f5;'>$safeName</strong>,<br>
                            A request was received to reset your <strong>QuickiBite Staff Portal ($safeRole)</strong> password. Use the single-use 6-digit verification code below:
                          </p>

                          <!-- OTP Code Box -->
                          <div style='background-color:#09090b; border:2px dashed #f59e0b; border-radius:16px; padding:22px 16px; text-align:center; margin:24px 0;'>
                            <span style='font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#f59e0b; display:block; margin-bottom:8px;'>RESET VERIFICATION CODE</span>
                            <span style='font-size:38px; font-weight:900; letter-spacing:8px; font-family:Courier, monospace; color:#ffffff;'>$otp</span>
                            <span style='font-size:11px; color:#71717a; display:block; margin-top:8px;'>Valid for 5 minutes</span>
                          </div>

                          <div style='background-color:#27272a40; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:4px; margin-bottom:20px;'>
                            <p style='margin:0; font-size:12px; line-height:1.5; color:#d4d4d8;'>
                              🔒 <strong>Security Warning:</strong> Never share this code. QuickiBite administrators will never ask for your code. If you did not make this request, please inform your manager.
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style='border-top:1px solid #27272a; padding:18px 24px; text-align:center; background-color:#121215;'>
                          <p style='margin:0; font-size:11px; color:#52525b;'>
                            &copy; " . date('Y') . " QuickiBite Staff Operations. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            ";

            $mail->AltBody = "Hello $safeName,\n\nYour QuickiBite Staff password reset code is: $otp\n\nThis code will expire in 5 minutes. If you did not request this, please notify your manager immediately.";

            $mail->send();
            return [
                'success' => true,
                'message' => 'Verification code sent to your email.'
            ];
        } catch (Exception $e) {
            error_log("PHPMailer Staff Reset Error: {$mail->ErrorInfo}");
            return [
                'success' => false,
                'message' => "Could not send email: {$mail->ErrorInfo}"
            ];
        }
    }
}
