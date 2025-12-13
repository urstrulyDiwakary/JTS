package com.app.repository;

import com.app.entity.ContactForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactFormRepository extends JpaRepository<ContactForm, Long> {

    List<ContactForm> findByOrderByCreatedAtDesc();

    List<ContactForm> findByIsReadOrderByCreatedAtDesc(boolean isRead);

    @Query("SELECT COUNT(c) FROM ContactForm c WHERE c.createdAt >= :startOfDay AND c.createdAt < :endOfDay")
    Long countByCreatedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);

    Long countByIsRead(boolean isRead);

    List<ContactForm> findByServiceOrderByCreatedAtDesc(String service);

    List<ContactForm> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
}
