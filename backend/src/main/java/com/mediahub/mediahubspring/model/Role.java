package com.mediahub.mediahubspring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(nullable = false)
    private final LocalDateTime createdAt = LocalDateTime.now();

    // Empty constructor for JPA
    public Role() {
    }

    // Constructor overloading
    public Role(String name) {
        this.name = name;
    }

    // GETTERS

    public Long getId() {
        return id;
    }

    public String getName() {
        return this.name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // SETTERS

    public void setName(String name) {
        this.name = name;
    }
}
