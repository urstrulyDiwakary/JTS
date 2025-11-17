package com.app.admin.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping
    public String adminHome(HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Admin Dashboard");
        return "admin/index";
    }

    @GetMapping("/analytics")
    public String analytics(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Analytics");
        return "admin/analytics";
    }

    @GetMapping("/projects")
    public String projects(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Projects");
        return "admin/projects";
    }

    @GetMapping("/users")
    public String users(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Users");
        return "admin/users";
    }

    @GetMapping("/billing")
    public String billing(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Billing");
        return "admin/billing";
    }

    @GetMapping("/settings")
    public String settings(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Settings");
        return "admin/settings";
    }

    @GetMapping("/tasks")
    public String tasks(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Tasks");
        return "admin/tasks";
    }

    @GetMapping("/login")
    public String login(Model model, HttpSession session) {
        // If already logged in, redirect to dashboard
        if (session.getAttribute("adminUser") != null) {
            return "redirect:/admin/dashboard";
        }
        model.addAttribute("pageTitle", "Admin Login");
        return "admin/login page";
    }

    @PostMapping("/login")
    public String loginProcess(@RequestParam(required = false) String email,
                              @RequestParam(required = false) String username,
                              @RequestParam String password,
                              Model model,
                              HttpSession session) {
        // Support both email and username fields from different forms
        String loginId = email != null ? email : username;

        // Simple authentication logic - you can enhance this later
        // For now, we'll use basic credentials check
        if (loginId != null && password != null && !loginId.isEmpty() && !password.isEmpty()) {
            // You can add more sophisticated authentication here
            // For example: checking against database
            // For now accepting admin@admin.com or admin with password: admin
            if (("admin@admin.com".equals(loginId) || "admin".equals(loginId)) && "admin".equals(password)) {
                // Create user session
                Map<String, String> adminUser = new HashMap<>();
                adminUser.put("username", "Admin User");
                adminUser.put("email", "admin@admin.com");
                adminUser.put("role", "Administrator");
                session.setAttribute("adminUser", adminUser);
                return "redirect:/admin/dashboard";
            }
        }
        model.addAttribute("error", "Invalid credentials");
        return "admin/login page";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/admin/login";
    }

    @GetMapping("/api/current-user")
    @ResponseBody
    public ResponseEntity<Map<String, String>> getCurrentUser(HttpSession session) {
        @SuppressWarnings("unchecked")
        Map<String, String> adminUser = (Map<String, String>) session.getAttribute("adminUser");

        if (adminUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        return ResponseEntity.ok(adminUser);
    }
}

