package com.mediahub.mediahubspring.model;

import com.mediahub.mediahubspring.model.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String profileImage;

    @Column(nullable = false)
    private final LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user")
    private Set<WatchList> watchLists = new HashSet<>();;

    // @ManyToMany - Specifies the type of relation
    // fetch = FetchType.LAZY - Roles are not loaded together with the user
    // better for performances
    // @JoinTable - Creates a bridge table for the many-to-many relation
    // joinColumns = @JoinColumn(name = "user_id") -
    // specifies the column for the current class (User) in the join table
    // inverseJoinColumns = @JoinColumn(name = "role_id")
    // role_id is a FOREIGN KEY that points to roles.id
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Empty constructor for JPA
    public User() {
    }

    // Constructor overloading
    public User(String firstName,
                String lastName,
                String email,
                String password,
                String profileImage,
                Set<Role> roles,
                Set<WatchList> watchLists) {

        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
        this.roles = roles;
        this.watchLists = watchLists;
    }

    // GETTERS
    public Long getId() {
        return this.id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public Set<Role> getRoles() {
        return this.roles;
    }

    public Set<WatchList> getWatchLists() {
        return watchLists;
    }

    // SETTERS

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public void setWatchLists(Set<WatchList> watchLists) {
        this.watchLists = watchLists;
    }


    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> {
                    String roleName = role.getName();
                    String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                    return new SimpleGrantedAuthority(authority.toUpperCase());
                })
                .toList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

}
