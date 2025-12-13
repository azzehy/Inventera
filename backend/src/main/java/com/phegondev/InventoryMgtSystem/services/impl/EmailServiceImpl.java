package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // I sould change this url in application.properties file to the frontend login url
    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void sendManagerWelcomeEmail(String toEmail, String managerName, String temporaryPassword, String loginUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Inventera - Manager Account Created");

            String emailContent = buildManagerWelcomeEmailContent(managerName, toEmail, temporaryPassword, loginUrl);
            helper.setText(emailContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
    // if we want to send a simple text email 
    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("Failed to send simple email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildManagerWelcomeEmailContent(String managerName, String email, String temporaryPassword, String loginUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border: 1px solid #ddd;
                        border-radius: 0 0 5px 5px;
                    }
                    .credentials {
                        background-color: #fff;
                        padding: 20px;
                        border-left: 4px solid #4CAF50;
                        margin: 20px 0;
                    }
                    .credential-row {
                        margin: 10px 0;
                    }
                    .label {
                        font-weight: bold;
                        color: #555;
                    }
                    .value {
                        color: #000;
                        font-family: monospace;
                        background-color: #f5f5f5;
                        padding: 5px 10px;
                        border-radius: 3px;
                        display: inline-block;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .button:hover {
                        background-color: #45a049;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #777;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Welcome to Inventera</h1>
                </div>
                
                <div class="content">
                    <h2>Hello %s!</h2>
                    
                    <p>Your manager account has been successfully created. You now have access to the Inventera.</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials</h3>
                        <div class="credential-row">
                            <span class="label">Email:</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="credential-row">
                            <span class="label">Temporary Password:</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="credential-row">
                            <span class="label">Role:</span>
                            <span class="value">MANAGER</span>
                        </div>
                    </div>
                    
                    <div class="warning">
                        <strong>Important Security Notice:</strong>
                        <p>Please change your password immediately after your first login for security purposes. And verify your data if it is correct</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="%s/login" class="button">Go to Login Page</a>
                    </div>
                    
                    <h3>What you can do as a Manager:</h3>
                    <ul>
                        <li>Manage products and inventory</li>
                        <li>Create and manage transactions</li>
                        <li>View enterprise reports and analytics</li>
                        <li>Manage business partners</li>
                        <li>And much more...</li>
                    </ul>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact the administrator.</p>
                    
                    <p>Best regards,<br>
                    <strong>Inventera Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2025 Inventera. All rights reserved.</p>
                </div>
            </body>
            </html>
            """.formatted(managerName, email, temporaryPassword, frontendUrl);
    }
}