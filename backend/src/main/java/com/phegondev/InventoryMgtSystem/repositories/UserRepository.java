package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByEnterpriseId(Long enterpriseId);
    List<User> findByRole(UserRole role);
    List<User> findByEnterpriseIdAndRole(Long enterpriseId, UserRole role);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByResetToken(String resetToken);
}
