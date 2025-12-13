package com.phegondev.InventoryMgtSystem.services;

public interface EmailService {
    void sendManagerWelcomeEmail(String toEmail, String managerName, String temporaryPassword, String loginUrl);
    void sendSimpleEmail(String to, String subject, String body);
}