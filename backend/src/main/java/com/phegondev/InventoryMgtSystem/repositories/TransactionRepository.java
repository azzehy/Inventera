package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction>{
    List<Transaction> findByEnterpriseId(Long enterpriseId);
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByPartnerId(Long partnerId);
    List<Transaction> findByEnterpriseIdAndTransactionType(Long enterpriseId, TransactionType type);
    List<Transaction> findByEnterpriseIdAndStatus(Long enterpriseId, TransactionStatus status);

    Page<Transaction> findByEnterpriseId(Long enterpriseId, Pageable pageable);
    Page<Transaction> findByPartnerId(Long partnerId, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE t.enterprise.id = :enterpriseId AND t.createdAt BETWEEN :start AND :end")
    List<Transaction> findByEnterpriseIdAndDateRange(Long enterpriseId, LocalDateTime start, LocalDateTime end);
}

