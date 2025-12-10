// package com.phegondev.InventoryMgtSystem.config;

// import com.phegondev.InventoryMgtSystem.enums.UserRole;
// import com.phegondev.InventoryMgtSystem.models.User;
// import com.phegondev.InventoryMgtSystem.repositories.UserRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.crypto.password.PasswordEncoder;

// @Configuration
// @RequiredArgsConstructor
// @Slf4j
// public class DataInitializer {

//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;

//     @Bean
//     CommandLineRunner initDatabase() {
//         return args -> {
//             if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
//                 User admin = User.builder()
//                         .name("Admin")
//                         .email("admin@admin.com")
//                         .password(passwordEncoder.encode("admin123"))
//                         .phoneNumber("0000000000")
//                         .role(UserRole.ADMIN)
//                         .build();
                
//                 userRepository.save(admin);
//                 log.info("Admin user created successfully!");
//                 log.info("Email: admin@admin.com");
//                 log.info("Password: admin123");
//             } else {
//                 log.info("Admin user already exists");
//             }
//         };
//     }
// }