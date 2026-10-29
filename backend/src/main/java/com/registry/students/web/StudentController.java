package com.registry.students.web;

import com.registry.students.dto.StudentRequest;
import com.registry.students.dto.StudentResponse;
import com.registry.students.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    /** GET /api/students?q=anita — full list, or a free-text search. */
    @GetMapping
    public List<StudentResponse> list(@RequestParam(required = false) String q) {
        return service.findAll(q).stream().map(StudentResponse::from).toList();
    }

    /** GET /api/students/stats — small counters for the dashboard header. */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) {
        return StudentResponse.from(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        StudentResponse created = StudentResponse.from(service.create(request));
        return ResponseEntity
                .created(URI.create("/api/students/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return StudentResponse.from(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
