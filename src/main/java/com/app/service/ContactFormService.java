package com.app.service;

import com.app.entity.ContactForm;
import com.app.repository.ContactFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContactFormService {

    @Autowired
    private ContactFormRepository contactFormRepository;

    public ContactForm saveContactForm(ContactForm contactForm) {
        return contactFormRepository.save(contactForm);
    }

    public List<ContactForm> getAllSubmissions() {
        return contactFormRepository.findByOrderByCreatedAtDesc();
    }

    public List<ContactForm> getSubmissionsByReadStatus(boolean isRead) {
        return contactFormRepository.findByIsReadOrderByCreatedAtDesc(isRead);
    }

    public Optional<ContactForm> getSubmissionById(Long id) {
        return contactFormRepository.findById(id);
    }

    public ContactForm markAsRead(Long id) {
        Optional<ContactForm> submission = contactFormRepository.findById(id);
        if (submission.isPresent()) {
            ContactForm form = submission.get();
            form.setRead(true);
            return contactFormRepository.save(form);
        }
        return null;
    }

    public ContactForm markAsUnread(Long id) {
        Optional<ContactForm> submission = contactFormRepository.findById(id);
        if (submission.isPresent()) {
            ContactForm form = submission.get();
            form.setRead(false);
            return contactFormRepository.save(form);
        }
        return null;
    }

    public void deleteSubmission(Long id) {
        contactFormRepository.deleteById(id);
    }

    public long getTotalCount() {
        return contactFormRepository.count();
    }

    public long getUnreadCount() {
        return contactFormRepository.countByIsRead(false);
    }

    public long getReadCount() {
        return contactFormRepository.countByIsRead(true);
    }

    public long getTodayCount() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return contactFormRepository.countByCreatedAtBetween(startOfDay, endOfDay);
    }

    public List<ContactForm> getSubmissionsByService(String service) {
        return contactFormRepository.findByServiceOrderByCreatedAtDesc(service);
    }

    public List<ContactForm> getSubmissionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return contactFormRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }
}
