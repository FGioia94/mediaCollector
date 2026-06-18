package com.mediahub.mediahubspring.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        ensureRoleExists("USER");
    }

    @Test
    void register_thenLogin_withSameCredentials_succeeds() throws Exception {
        String email = "fresh-user@example.com";
        String password = "password12";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterPayload(
                                email,
                                password,
                                "Fresh",
                                "User",
                                null
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.userId").isNumber());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @Test
    void register_thenLogin_withBcryptLookingPassword_succeeds() throws Exception {
        String email = "bcrypt-prefix@example.com";
        String password = "$2a$abc12345";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterPayload(
                                email,
                                password,
                                "Prefix",
                                "User",
                                null
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.userId").isNumber());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @Test
    void register_thenLogin_withDifferentEmailCase_succeeds() throws Exception {
        String registeredEmail = "case.user@example.com";
        String loginEmail = "Case.User@Example.com";
        String password = "password12";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterPayload(
                                registeredEmail,
                                password,
                                "Case",
                                "User",
                                null
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(registeredEmail))
                .andExpect(jsonPath("$.userId").isNumber());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(loginEmail, password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(registeredEmail))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @Test
    void profileImageUpdate_acceptsCanonicalAndTrailingSlashPaths() throws Exception {
        String email = "info@francescogioia.it";
        String password = "password12";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterPayload(
                                email,
                                password,
                                "Francesco",
                                "Gioia",
                                null
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        String loginResponse = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginResponse);
        String token = loginJson.get("token").asText();

        mockMvc.perform(put("/profile/me/image")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"profileImage\":\"https://cdn.example.com/p1.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileImage").value("https://cdn.example.com/p1.png"));

        mockMvc.perform(put("/profile/me/image/")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"profileImage\":\"https://cdn.example.com/p2.png\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileImage").value("https://cdn.example.com/p2.png"));

        mockMvc.perform(get("/profile/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.profileImage").value("https://cdn.example.com/p2.png"));
    }

    private void ensureRoleExists(String roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private record RegisterPayload(
            String email,
            String password,
            String firstName,
            String lastName,
            String profileImage
    ) {}

    private record LoginPayload(String email, String password) {}
}