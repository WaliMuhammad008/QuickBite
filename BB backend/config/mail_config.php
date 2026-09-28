<?php
// BigBite Gmail SMTP Configuration

return [
    // Gmail SMTP Server Settings
    'smtp_host'     => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
    'smtp_port'     => (int)(getenv('SMTP_PORT') ?: 587),
    'smtp_secure'   => getenv('SMTP_SECURE') ?: 'tls', // 'tls' (port 587) or 'ssl' (port 465)
    'smtp_auth'     => true,

    // Your Gmail Address
    'smtp_username' => getenv('SMTP_USERNAME') ?: 'imuneebhassan6@gmail.com',

    // Google 16-Character App Password (from Google Account -> Security -> 2-Step Verification -> App Passwords)
    'smtp_password' => getenv('SMTP_PASSWORD') ?: 'cmcj fcgu xfgn uzqz',

    // Display sender details
    'from_email'    => getenv('SMTP_FROM_EMAIL') ?: 'imuneebhassan6@gmail.com',
    'from_name'     => 'BigBite'
];
