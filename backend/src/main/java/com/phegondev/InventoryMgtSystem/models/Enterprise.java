package com.phegondev.InventoryMgtSystem.models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "enterprises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enterprise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String address;
    
    @Column(unique = true)
    private String email;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL)
    private List<User> users;
    
    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL)
    private List<Product> products;
    
    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL)
    private List<Category> categories;
    
    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL)
    private List<BusinessPartner> partners;
    
    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Enterprise{id=" + id + ", name='" + name + "', address='" + address + "', email='" + email + "', createdAt=" + createdAt + "}";
    }
}