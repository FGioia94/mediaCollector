package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Optional means it can return <T> or Optional.empty() if there is no value to return
    Optional<Role> findByName(String name);
}
