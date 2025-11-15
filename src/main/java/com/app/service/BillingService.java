package com.app.service;

import com.app.entity.Billing;
import com.app.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    @Autowired
    private BillingRepository billingRepository;

    public List<Billing> getAllBillings() {
        return billingRepository.findAll();
    }

    public Optional<Billing> getBillingById(Long id) {
        return billingRepository.findById(id);
    }

    public List<Billing> getBillingsByStatus(String status) {
        return billingRepository.findByStatus(status);
    }

    public List<Billing> getBillingsByProjectId(Long projectId) {
        return billingRepository.findByProjectId(projectId);
    }

    public Billing createBilling(Billing billing) {
        return billingRepository.save(billing);
    }

    public Billing updateBilling(Billing billing) {
        return billingRepository.save(billing);
    }

    public void deleteBilling(Long id) {
        billingRepository.deleteById(id);
    }
}

