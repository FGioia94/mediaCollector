package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.RoleRepository;
import com.mediahub.mediahubspring.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void addUser_shouldHashPasswordBeforeSaving() {
        User user = new User();
        user.setEmail("john@example.com");
        user.setPassword("plainPass123");

        when(userRepository.findByEmailIgnoreCase("john@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(new Role("USER")));
        when(passwordEncoder.encode("plainPass123")).thenReturn("hashed-pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = service.addUser(user);

        assertEquals("hashed-pass", saved.getPassword());
        assertTrue(saved.getRoles().stream().anyMatch(r -> "USER".equals(r.getName())));
    }

    @Test
    void update_shouldHashNewPlainPasswordBeforeSaving() {
        User existing = new User();
        existing.setEmail("john@example.com");
        existing.setPassword("old-hash");

        User updates = new User();
        updates.setPassword("newPlainPass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("newPlainPass")).thenReturn("new-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = service.update(1L, updates);

        assertEquals("new-hash", saved.getPassword());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("new-hash", captor.getValue().getPassword());
    }
}
