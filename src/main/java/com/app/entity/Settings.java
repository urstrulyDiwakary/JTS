package com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    // Profile Settings
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column
    private String email;

    @Column
    private String phone;

    @Column
    private String role;

    @Column(name = "profile_picture")
    private String profilePicture;



    // Notification Settings
    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "sms_notifications")
    private Boolean smsNotifications = false;

    @Column(name = "weekly_report")
    private Boolean weeklyReport = true;

    // Security Settings

    @Column(name = "session_timeout")
    private Integer sessionTimeout = 30; // minutes

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    // Appearance Settings

    @Column
    private String language = "en";

    @Column(name = "timezone")
    private String timezone = "Asia/Kolkata";

    @Column(name = "date_format")
    private String dateFormat = "DD/MM/YYYY";

    // Company Settings
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_email")
    private String companyEmail;

    @Column(name = "company_phone")
    private String companyPhone;

    @Column(name = "company_website")
    private String companyWebsite;

    @Column(name = "tax_id")
    private String taxId;

    // Integration Settings
    @Column(name = "slack_enabled")
    private Boolean slackEnabled = false;

    @Column(name = "slack_webhook")
    private String slackWebhook;

    @Column(name = "google_calendar_enabled")
    private Boolean googleCalendarEnabled = false;

    @Column(name = "github_enabled")
    private Boolean githubEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

