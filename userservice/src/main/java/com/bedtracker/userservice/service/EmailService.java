package com.bedtracker.userservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Async("taskExecutor")
    public void sendVerificationEmail(String to, String name, String otp) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("MediTrack Account Verification");

            String htmlContent = buildEmailContent(name, otp);
            helper.setText(htmlContent, true);

            emailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email", e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    private String buildEmailContent(String name, String otp) {
        return "<div style=\"font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2\">" +
                "  <div style=\"margin:50px auto;width:70%;padding:20px 0\">" +
                "    <div style=\"border-bottom:1px solid #eee\">" +
                "      <a href=\"\" style=\"font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600\">MediTrack</a>" +
                "    </div>" +
                "    <p style=\"font-size:1.1em\">Hi, " + name + "</p>" +
                "    <p>Thank you for choosing MediTrack. Use the following OTP to complete your Sign Up procedures. OTP is valid for 15 minutes</p>" +
                "    <h2 style=\"background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;\">" + otp + "</h2>" +
                "    <p style=\"font-size:0.9em;\">Regards,<br />MediTrack Team</p>" +
                "    <hr style=\"border:none;border-top:1px solid #eee\" />" +
                "  </div>" +
                "</div>";
    }
}