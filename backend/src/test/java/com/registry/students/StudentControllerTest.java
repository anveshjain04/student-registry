package com.registry.students;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.registry.students.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private StudentRepository repository;

    private static final Map<String, String> ANANYA = Map.of(
            "studentId", "STU-2024-001",
            "rollNo", "CS-21/047",
            "fullName", "Ananya Rao",
            "email", "ananya.rao@gmail.com",
            "phone", "+91 98765 43210"
    );

    @BeforeEach
    void clean() {
        repository.deleteAll();
    }

    private String body(Map<String, String> payload) throws Exception {
        return json.writeValueAsString(payload);
    }

    private void createAnanya() throws Exception {
        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(body(ANANYA)))
                .andExpect(status().isCreated());
    }

    @Test
    void createsStudentAndNormalisesPhone() throws Exception {
        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(body(ANANYA)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.fullName").value("Ananya Rao"))
                .andExpect(jsonPath("$.phone").value("+919876543210"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void rejectsInvalidPayloadWithFieldErrors() throws Exception {
        String payload = body(Map.of(
                "studentId", "x",
                "rollNo", "",
                "fullName", "A",
                "email", "not-an-email",
                "phone", "12"
        ));

        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("email")))
                .andExpect(jsonPath("$.fieldErrors", hasKey("studentId")))
                .andExpect(jsonPath("$.fieldErrors", hasKey("phone")));
    }

    @Test
    void rejectsDuplicateStudentIdAndEmail() throws Exception {
        createAnanya();

        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(body(ANANYA)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors", hasKey("studentId")));

        String sameEmail = body(Map.of(
                "studentId", "STU-2024-002",
                "rollNo", "CS-21/048",
                "fullName", "Impostor Rao",
                "email", "ananya.rao@gmail.com",
                "phone", "9876543210"
        ));

        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(sameEmail))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fieldErrors", hasKey("email")));
    }

    @Test
    void listsAndSearchesAcrossColumns() throws Exception {
        createAnanya();

        mvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/students").param("q", "ananya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/students").param("q", "CS-21"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/students").param("q", "nobody"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void updatesAndDeletesStudent() throws Exception {
        createAnanya();
        long id = repository.findAll().get(0).getId();

        String updated = body(Map.of(
                "studentId", "STU-2024-001",
                "rollNo", "CS-21/099",
                "fullName", "Ananya R. Rao",
                "email", "ananya.rao@gmail.com",
                "phone", "9876543210"
        ));

        mvc.perform(put("/api/students/" + id).contentType(MediaType.APPLICATION_JSON).content(updated))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rollNo").value("CS-21/099"))
                .andExpect(jsonPath("$.fullName").value("Ananya R. Rao"));

        mvc.perform(delete("/api/students/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/students/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void statsReflectTotals() throws Exception {
        createAnanya();

        mvc.perform(get("/api/students/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.addedThisWeek").value(1));
    }
}
