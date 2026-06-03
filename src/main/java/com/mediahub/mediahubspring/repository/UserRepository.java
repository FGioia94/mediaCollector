package com.mediahub.mediahubspring.repository;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Optional means it can return <T> or Optional.empty() if there is no value to return
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findWithRolesByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findWithRolesByEmailIgnoreCase(String email);

    boolean existsByRoles_Name(String roleName);

}
