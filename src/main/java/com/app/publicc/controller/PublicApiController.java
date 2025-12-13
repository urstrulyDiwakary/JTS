package com.app.publicc.controller;

import com.app.entity.Project;
import com.app.entity.ContactForm;
import com.app.service.ProjectService;
import com.app.service.ContactFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class PublicApiController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ContactFormService contactFormService;

    @GetMapping("/projects/latest")
    public ResponseEntity<List<Project>> getLatestProjects() {
        List<Project> projects = projectService.getLatestProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/all")
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/contact")
    public ResponseEntity<Map<String, String>> submitContactForm(@RequestBody ContactForm contactForm) {
        Map<String, String> response = new HashMap<>();
        try {
            contactFormService.saveContactForm(contactForm);
            response.put("status", "success");
            response.put("message", "Thank you for your message! We'll get back to you soon.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Sorry, something went wrong. Please try again later.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}

