package com.phegondev.InventoryMgtSystem.specification;

import com.phegondev.InventoryMgtSystem.models.Transaction;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TransactionFilter {

    public static Specification<Transaction> byFilter(String searchValue) {
        return (root, query, criteriaBuilder) -> {
            if (searchValue == null || searchValue.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String searchPattern = "%" + searchValue.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            // Transaction fields
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("description")), 
                searchPattern
            ));
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("note")), 
                searchPattern
            ));
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("status").as(String.class)), 
                searchPattern
            ));
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(root.get("transactionType").as(String.class)), 
                searchPattern
            ));

            // User fields
            Join<Object, Object> userJoin = root.join("user", JoinType.INNER);
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(userJoin.get("name")), 
                searchPattern
            ));
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(userJoin.get("email")), 
                searchPattern
            ));
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(userJoin.get("phoneNumber")), 
                searchPattern
            ));

            // Enterprise fields
            Join<Object, Object> enterpriseJoin = root.join("enterprise", JoinType.INNER);
            predicates.add(criteriaBuilder.like(
                criteriaBuilder.lower(enterpriseJoin.get("name")), 
                searchPattern
            ));

            // Partner fields
            Join<Object, Object> partnerJoin = root.join("partner", JoinType.LEFT);

            Predicate partnerNameNotNull = criteriaBuilder.isNotNull(partnerJoin.get("name"));
            Predicate partnerNameLike = criteriaBuilder.like(
                criteriaBuilder.lower(partnerJoin.get("name")), 
                searchPattern
            );
            predicates.add(criteriaBuilder.and(partnerNameNotNull, partnerNameLike));

            Predicate partnerEmailNotNull = criteriaBuilder.isNotNull(partnerJoin.get("email"));
            Predicate partnerEmailLike = criteriaBuilder.like(
                criteriaBuilder.lower(partnerJoin.get("email")), 
                searchPattern
            );
            predicates.add(criteriaBuilder.and(partnerEmailNotNull, partnerEmailLike));

            Predicate partnerAddressNotNull = criteriaBuilder.isNotNull(partnerJoin.get("address"));
            Predicate partnerAddressLike = criteriaBuilder.like(
                criteriaBuilder.lower(partnerJoin.get("address")), 
                searchPattern
            );
            predicates.add(criteriaBuilder.and(partnerAddressNotNull, partnerAddressLike));

            query.distinct(true);

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }

    // New method for filtering transactions by month and year
    public static Specification<Transaction> byMonthAndYear(int month, int year) {
        return (root, query, criteriaBuilder) -> {
            // Use the month and year functions on the createdAt date field
            Expression<Integer> monthExpression = criteriaBuilder.function("month", Integer.class, root.get("createdAt"));
            Expression<Integer> yearExpression = criteriaBuilder.function("year", Integer.class, root.get("createdAt"));

            // Create predicates for the month and year
            Predicate monthPredicate = criteriaBuilder.equal(monthExpression, month);
            Predicate yearPredicate = criteriaBuilder.equal(yearExpression, year);

            // Combine the month and year predicates
            return criteriaBuilder.and(monthPredicate, yearPredicate);
        };
    }
}
