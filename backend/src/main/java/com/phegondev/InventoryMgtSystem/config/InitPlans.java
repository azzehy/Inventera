package com.phegondev.InventoryMgtSystem.config;

import com.phegondev.InventoryMgtSystem.models.Plan;
import com.phegondev.InventoryMgtSystem.repositories.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class InitPlans {

    private final PlanRepository planRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (planRepository.count() == 0) {

                // Plan GRATUIT
                Plan free = Plan.builder()
                        .name("FREE")
                        .priceMonthly(BigDecimal.ZERO)
                        .maxProducts(5)
                        .maxUsers(2)
                        .build();

                // Plan BASIC
                Plan basic = Plan.builder()
                        .name("BASIC")
                        .priceMonthly(new BigDecimal("50.00"))
                        .maxProducts(100)
                        .maxUsers(20)
                        .build();

                // Plan PREMIUM
                Plan premium = Plan.builder()
                        .name("PREMIUM")
                        .priceMonthly(new BigDecimal("350.00"))
                        .maxProducts(999999)
                        .maxUsers(999999)
                        .build();

                planRepository.save(free);
                planRepository.save(basic);
                planRepository.save(premium);

                System.out.println("Plans initialized!");
            }
        };
    }
}