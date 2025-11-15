package com.app.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping
    public String adminHome() {
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Admin Dashboard");
        return "admin/index";
    }

    @GetMapping("/analytics")
    public String analytics(Model model) {
        model.addAttribute("pageTitle", "Analytics");
        return "admin/analytics";
    }

    @GetMapping("/projects")
    public String projects(Model model) {
        model.addAttribute("pageTitle", "Projects");
        return "admin/projects";
    }

    @GetMapping("/users")
    public String users(Model model) {
        model.addAttribute("pageTitle", "Users");
        return "admin/users";
    }

    @GetMapping("/billing")
    public String billing(Model model) {
        model.addAttribute("pageTitle", "Billing");
        return "admin/billing";
    }

    @GetMapping("/settings")
    public String settings(Model model) {
        model.addAttribute("pageTitle", "Settings");
        return "admin/settings";
    }

    @GetMapping("/tasks")
    public String tasks(Model model) {
        model.addAttribute("pageTitle", "Tasks");
        return "admin/tasks";
    }

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("pageTitle", "Admin Login");
        return "admin/login page";
    }

    @PostMapping("/login")
    public String loginProcess(@RequestParam(required = false) String email,
                              @RequestParam(required = false) String username,
                              @RequestParam String password,
                              Model model) {
        // Support both email and username fields from different forms
        String loginId = email != null ? email : username;

        // Simple authentication logic - you can enhance this later
        // For now, we'll use basic credentials check
        if (loginId != null && password != null && !loginId.isEmpty() && !password.isEmpty()) {
            // You can add more sophisticated authentication here
            // For example: checking against database
            // For now accepting admin@admin.com or admin with password: admin
            if (("admin@admin.com".equals(loginId) || "admin".equals(loginId)) && "admin".equals(password)) {
                return "redirect:/admin/dashboard";
            }
        }
        model.addAttribute("error", "Invalid credentials");
        return "admin/login page";
    }
}

