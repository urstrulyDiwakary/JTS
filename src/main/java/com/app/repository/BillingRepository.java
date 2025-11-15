package com.app.repository;

import com.app.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByStatus(String status);
    List<Billing> findByProjectId(Long projectId);
}

