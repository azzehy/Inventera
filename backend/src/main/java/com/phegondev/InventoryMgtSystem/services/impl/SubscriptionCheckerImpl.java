package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.models.Enterprise;
import com.phegondev.InventoryMgtSystem.models.Subscription;
import com.phegondev.InventoryMgtSystem.repositories.SubscriptionRepository;
import com.phegondev.InventoryMgtSystem.services.SubscriptionChecker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionCheckerImpl implements SubscriptionChecker {

    private final SubscriptionRepository subscriptionRepository;

    public boolean canAddProduct(Enterprise enterprise) {
        Subscription subscription = subscriptionRepository
                .findByEnterpriseAndStatus(enterprise, "ACTIVE")
                .orElse(null);

        if (subscription == null) {
            int currentProducts = enterprise.getProducts() != null ? 
                                  enterprise.getProducts().size() : 0;
            return currentProducts < 5;
        }

        int maxProducts = subscription.getPlan().getMaxProducts();
        int currentProducts = enterprise.getProducts() != null ? 
                              enterprise.getProducts().size() : 0;

        return currentProducts < maxProducts;
    }

    public boolean canAddUser(Enterprise enterprise) {
        Subscription subscription = subscriptionRepository
                .findByEnterpriseAndStatus(enterprise, "ACTIVE")
                .orElse(null);

        if (subscription == null) {
            int currentUsers = enterprise.getUsers() != null ? 
                               enterprise.getUsers().size() : 0;
            return currentUsers < 2;
        }

        int maxUsers = subscription.getPlan().getMaxUsers();
        int currentUsers = enterprise.getUsers() != null ? 
                           enterprise.getUsers().size() : 0;

        return currentUsers < maxUsers;
    }

    public int getRemainingProducts(Enterprise enterprise) {
        Subscription subscription = subscriptionRepository
                .findByEnterpriseAndStatus(enterprise, "ACTIVE")
                .orElse(null);

        int maxProducts = subscription != null ? 
                          subscription.getPlan().getMaxProducts() : 5;
        int currentProducts = enterprise.getProducts() != null ? 
                              enterprise.getProducts().size() : 0;

        return Math.max(0, maxProducts - currentProducts);
    }

    public int getRemainingUsers(Enterprise enterprise) {
        Subscription subscription = subscriptionRepository
                .findByEnterpriseAndStatus(enterprise, "ACTIVE")
                .orElse(null);

        int maxUsers = subscription != null ? 
                       subscription.getPlan().getMaxUsers() : 2;
        int currentUsers = enterprise.getUsers() != null ? 
                           enterprise.getUsers().size() : 0;

        return Math.max(0, maxUsers - currentUsers);
    }
}