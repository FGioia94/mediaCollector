package com.mediahub.mediahubspring.security;

import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.UserRepository;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository repository;

    public UserDetailsServiceImpl(UserRepository repository){
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username){
        String normalizedEmail = EmailNormalizer.normalize(username);
        User user = repository.findWithRolesByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + normalizedEmail));
        return new UserDetailsImpl(user);
    }
}
