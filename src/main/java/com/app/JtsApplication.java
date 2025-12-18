package com.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JtsApplication {
    public static void main(String[] args) {
        System.out.println("🚀 Starting JTS Application...");
        SpringApplication.run(JtsApplication.class, args);
        System.out.println("✅ JTS Application started successfully!");
        System.out.println("🌐 Access the application at: http://localhost:8000");
        System.out.println("🔐 Admin login: http://localhost:8000/admin/login");
        System.out.println("📋 Default credentials: admin/admin or admin@admin.com/admin");
    }
}