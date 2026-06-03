package com.mediahub.mediahubspring.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.security.JwtAuthenticationFilter;
import com.mediahub.mediahubspring.security.JwtService;
import com.mediahub.mediahubspring.service.RoleService;
import com.mediahub.mediahubspring.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private RoleService roleService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void register_withInvalidPayload_returnsBadRequest() throws Exception {
        String payload = """
                {
                  "email": "not-an-email",
                  "password": "short",
                  "firstName": "",
                  "lastName": "Doe"
                }
                """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withInvalidPayload_returnsBadRequest() throws Exception {
        String payload = """
                {
                  "email": "",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withValidPayload_returnsTokenAndEmail() throws Exception {
        Role role = new Role("USER");
        User saved = new User();
        saved.setEmail("john@example.com");

        when(roleService.getByName("USER")).thenReturn(role);
        when(userService.addUser(any(User.class))).thenReturn(saved);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        String payload = objectMapper.writeValueAsString(new RegisterPayload(
                "john@example.com",
                "password12",
                "John",
                "Doe",
                "https://cdn.example.com/john.png"
        ));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    private record RegisterPayload(
            String email,
            String password,
            String firstName,
            String lastName,
            String profileImage
    ) {}
}
