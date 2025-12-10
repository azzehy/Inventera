package com.phegondev.InventoryMgtSystem.models;

import com.phegondev.InventoryMgtSystem.enums.BusinessPartnerType;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "business_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    private String numero;
    
    private String address;

    @Column(unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessPartnerType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;
    
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
    
    @Override
    public String toString() {
        return "BusinessPartner{id=" + id + ", name='" + name + "', type=" + type + " , email='" + email + "', numero='" + numero + "', address='" + address + "', enterprise=" + enterprise.getName() + "}";
    }
}
