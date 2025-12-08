package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.TransactionLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionLineRepository extends JpaRepository<TransactionLine, Long> {
    List<TransactionLine> findByTransactionId(Long transactionId);
    List<TransactionLine> findByProductId(Long productId);
}