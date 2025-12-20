package com.phegondev.InventoryMgtSystem.config;

import com.phegondev.InventoryMgtSystem.models.Plan;
import com.phegondev.InventoryMgtSystem.repositories.PlanRepository;
import com.stripe.Stripe;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.ProductCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class InitPlans {

    private final PlanRepository planRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (planRepository.count() == 0) {
                
                // Plan FREE
                Plan free = Plan.builder()
                        .name("FREE")
                        .priceMonthly(BigDecimal.ZERO)
                        .maxProducts(5)
                        .maxUsers(2)
                        .stripePriceId(null)
                        .build();
                planRepository.save(free);

                // Plan BASIC
                String basicPriceId = createStripePlan("BASIC", 50);
                Plan basic = Plan.builder()
                        .name("BASIC")
                        .priceMonthly(new BigDecimal("50.00"))
                        .maxProducts(100)
                        .maxUsers(20)
                        .stripePriceId(basicPriceId)
                        .build();
                planRepository.save(basic);

                // Plan PREMIUM
                String premiumPriceId = createStripePlan("PREMIUM", 350);
                Plan premium = Plan.builder()
                        .name("PREMIUM")
                        .priceMonthly(new BigDecimal("350.00"))
                        .maxProducts(999999)
                        .maxUsers(999999)
                        .stripePriceId(premiumPriceId)
                        .build();
                planRepository.save(premium);

                log.info("Plans créés avec succès dans Stripe !");
            }
        };
    }

    private String createStripePlan(String name, int priceInMAD) {
        try {

            Product product = Product.create(
                ProductCreateParams.builder()
                    .setName(name + " Plan")
                    .setDescription("Abonnement " + name)
                    .build()
            );

            Price price = Price.create(
                PriceCreateParams.builder()
                    .setProduct(product.getId())
                    .setCurrency("mad")
                    .setUnitAmount((long) priceInMAD * 100)
                    .setRecurring(
                        PriceCreateParams.Recurring.builder()
                            .setInterval(PriceCreateParams.Recurring.Interval.MONTH)
                            .build()
                    )
                    .build()
            );

            log.info("Prix Stripe créé pour {}: {}", name, price.getId());
            return price.getId();

        } catch (Exception e) {
            log.error("Erreur Stripe pour {}: {}", name, e.getMessage());
            return null;
        }
    }
}