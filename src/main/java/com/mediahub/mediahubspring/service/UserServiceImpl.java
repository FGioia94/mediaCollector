package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.exception.UserNotFoundException;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.RoleRepository;
import com.mediahub.mediahubspring.repository.UserRepository;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User addUser(User user) {
        String normalizedEmail = EmailNormalizer.normalize(user.getEmail());
        user.setEmail(normalizedEmail);

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new DuplicateKeyException("User already exists for email: " + normalizedEmail);
        }
        Optional<Role> userRole = roleRepository.findByName("USER");
        if (userRole.isPresent()) {
            Set<Role> currentRoles = user.getRoles();
            currentRoles.add(userRole.get());
            user.setRoles(currentRoles);
        }
        if (user.getPassword() != null) {
            // Always hash before persistence so raw passwords are never stored.
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public User get(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User update(Long id, User updates) {
        User existing = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));

        if (updates.getFirstName() != null) {
            existing.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            existing.setLastName(updates.getLastName());
        }
        if (updates.getEmail() != null) {
            // Keep stored emails normalized for case-insensitive retrieval.
            existing.setEmail(EmailNormalizer.normalize(updates.getEmail()));
        }
        if (updates.getPassword() != null) {
            // Re-hash password on update when a new value is provided.
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        if (updates.getProfileImage() != null) {
            existing.setProfileImage(updates.getProfileImage());
        }

        return userRepository.save(existing);
    }

    @Override
    public User getByEmail(String email) {
        String normalizedEmail = EmailNormalizer.normalize(email);
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new UserNotFoundException(normalizedEmail));
    }

}
