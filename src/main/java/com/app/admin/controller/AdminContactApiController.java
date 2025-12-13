package com.app.admin.controller;

import com.app.entity.ContactForm;
import com.app.service.ContactFormService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact/admin")
public class AdminContactApiController {

    @Autowired
    private ContactFormService contactFormService;

    @GetMapping("/submissions")
    public ResponseEntity<List<ContactForm>> getAllSubmissions(HttpSession session) {
        // Temporarily disable authentication for testing
        // if (session.getAttribute("adminUser") == null) {
        //     return ResponseEntity.status(401).build();
        // }

        List<ContactForm> submissions = contactFormService.getAllSubmissions();
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/submissions/stats")
    public ResponseEntity<Map<String, Long>> getSubmissionStats(HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", contactFormService.getTotalCount());
        stats.put("unread", contactFormService.getUnreadCount());
        stats.put("read", contactFormService.getReadCount());
        stats.put("today", contactFormService.getTodayCount());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<ContactForm> getSubmissionById(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return ResponseEntity.status(401).build();
        }

        return contactFormService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/submissions/{id}/read")
    public ResponseEntity<ContactForm> markAsRead(@PathVariable Long id, HttpSession session) {
        // Temporarily disable authentication for testing
        // if (session.getAttribute("adminUser") == null) {
        //     return ResponseEntity.status(401).build();
        // }

        ContactForm updatedForm = contactFormService.markAsRead(id);
        if (updatedForm != null) {
            return ResponseEntity.ok(updatedForm);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/submissions/{id}/unread")
    public ResponseEntity<ContactForm> markAsUnread(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return ResponseEntity.status(401).build();
        }

        ContactForm updatedForm = contactFormService.markAsUnread(id);
        if (updatedForm != null) {
            return ResponseEntity.ok(updatedForm);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Map<String, String>> deleteSubmission(@PathVariable Long id, HttpSession session) {
        if (session.getAttribute("adminUser") == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            contactFormService.deleteSubmission(id);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Submission deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to delete submission");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/submissions/filter")
    public ResponseEntity<List<ContactForm>> getFilteredSubmissions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpSession session) {

        if (session.getAttribute("adminUser") == null) {
            return ResponseEntity.status(401).build();
        }

        List<ContactForm> submissions;

        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            submissions = contactFormService.getSubmissionsByDateRange(start, end);
        } else if ("read".equals(status)) {
            submissions = contactFormService.getSubmissionsByReadStatus(true);
        } else if ("unread".equals(status)) {
            submissions = contactFormService.getSubmissionsByReadStatus(false);
        } else if (service != null && !"all".equals(service)) {
            submissions = contactFormService.getSubmissionsByService(service);
        } else {
            submissions = contactFormService.getAllSubmissions();
        }

        return ResponseEntity.ok(submissions);
    }
}
