package com.app.admin.controller;

import com.app.entity.User;
import com.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String adminHome(HttpSession session) {
        System.out.println("🔐 [AdminController] /admin endpoint requested");
        if (session.getAttribute("adminUser") == null) {
            System.out.println("❌ No admin session found - Redirecting to /admin/login");
            return "redirect:/admin/login";
        }
        System.out.println("✅ Admin session exists - Redirecting to /admin/dashboard");
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

    @GetMapping("/forms")
    public String forms(Model model, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return "redirect:/admin/login";
        }
        model.addAttribute("pageTitle", "Forms");
        return "admin/forms";
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
        try {
            // Support both email and username fields from different forms
            String loginId = email != null ? email : username;

            // Database authentication with fallback to default admin
            if (loginId != null && password != null && !loginId.isEmpty() && !password.isEmpty()) {

                // Fallback to default admin credentials first (simpler approach)
                if (("admin@admin.com".equals(loginId) || "admin".equals(loginId)) && "admin".equals(password)) {
                    Map<String, String> adminUser = new HashMap<>();
                    adminUser.put("username", "Admin User");
                    adminUser.put("email", "admin@admin.com");
                    adminUser.put("role", "ADMIN");
                    adminUser.put("userId", "0");
                    session.setAttribute("adminUser", adminUser);
                    return "redirect:/admin/dashboard";
                }

                // Try database authentication
                try {
                    Optional<User> authenticatedUser = userService.authenticateUser(loginId, password);

                    // If not found by username, try by email
                    if (authenticatedUser.isEmpty()) {
                        Optional<User> userByEmail = userService.getUserByEmail(loginId);
                        if (userByEmail.isPresent() && userService.verifyPassword(password, userByEmail.get().getPassword())) {
                            authenticatedUser = userByEmail;
                        }
                    }

                    if (authenticatedUser.isPresent()) {
                        User user = authenticatedUser.get();


                        // Create user session for database user
                        Map<String, String> adminUser = new HashMap<>();
                        adminUser.put("username", user.getUsername());
                        adminUser.put("email", user.getEmail());
                        adminUser.put("role", user.getRole());
                        adminUser.put("userId", user.getId().toString());
                        session.setAttribute("adminUser", adminUser);
                        return "redirect:/admin/dashboard";
                    }
                } catch (Exception dbError) {
                    // Log database error but continue to fallback
                    System.err.println("Database authentication error: " + dbError.getMessage());
                    dbError.printStackTrace();
                }
            }

            model.addAttribute("error", "Invalid credentials");
            return "admin/login page";

        } catch (Exception e) {
            // Catch any unexpected errors
            System.err.println("Login process error: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Login system error. Please try again or contact support.");
            return "admin/login page";
        }
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

