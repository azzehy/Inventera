package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.Subscription;
import com.phegondev.InventoryMgtSystem.models.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByEnterpriseAndStatus(Enterprise enterprise, String status);

    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);

    boolean existsByStripeSubscriptionId(String stripeSubscriptionId);
}