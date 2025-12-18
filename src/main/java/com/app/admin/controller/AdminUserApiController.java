package com.app.admin.controller;

import com.app.entity.User;
import com.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserApiController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // Log incoming user data for debugging
            System.out.println("Creating user with data: " + user.toString());

            // Validate required fields
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
            }
            if (user.getRole() == null || user.getRole().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }

            // Clean up empty strings and set proper defaults
            if (user.getPhone() != null && user.getPhone().trim().isEmpty()) {
                user.setPhone(null);
            }
            if (user.getDepartment() != null && user.getDepartment().trim().isEmpty()) {
                user.setDepartment(null);
            }
            if (user.getStatus() == null || user.getStatus().trim().isEmpty()) {
                user.setStatus("Active");
            }

            User created = userService.createUser(user);
            System.out.println("User created successfully: " + created.getUsername());
            return ResponseEntity.ok(created);

        } catch (Exception e) {
            // Log the full error for debugging
            System.err.println("Error creating user: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();

            // Return user-friendly error message
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("duplicate key")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username or email already exists"));
            } else if (errorMessage != null && (errorMessage.contains("column") && errorMessage.contains("does not exist"))) {
                return ResponseEntity.internalServerError().body(Map.of("message",
                    "Database schema error: Missing required columns. Please run: psql -U postgres -d JTS -f complete_database_fix.sql"));
            } else if (errorMessage != null && errorMessage.contains("violates not-null constraint")) {
                return ResponseEntity.badRequest().body(Map.of("message",
                    "Required field missing: " + errorMessage));
            } else {
                return ResponseEntity.internalServerError().body(Map.of("message",
                    "Failed to create user: " + (errorMessage != null ? errorMessage : "Unknown error")));
            }
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userUpdate) {
        return userService.getUserById(id)
                .map(existingUser -> {
                    if (userUpdate.getUsername() != null) existingUser.setUsername(userUpdate.getUsername());
                    if (userUpdate.getEmail() != null) existingUser.setEmail(userUpdate.getEmail());
                    if (userUpdate.getPassword() != null) existingUser.setPassword(userUpdate.getPassword());
                    if (userUpdate.getRole() != null) existingUser.setRole(userUpdate.getRole());
                    User updated = userService.updateUser(existingUser);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}

