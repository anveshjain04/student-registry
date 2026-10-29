package com.registry.students.service;

import com.registry.students.dto.StudentRequest;
import com.registry.students.model.Student;
import com.registry.students.repository.StudentRepository;
import com.registry.students.web.DuplicateFieldException;
import com.registry.students.web.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Student> findAll(String query) {
        if (query == null || query.isBlank()) {
            return repository.findAll(Sort.by(Sort.Direction.ASC, "fullName"));
        }
        return repository.search(query.trim());
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("No student with id " + id));
    }

    public Student create(StudentRequest request) {
        String studentId = clean(request.studentId());
        String email = clean(request.email()).toLowerCase(Locale.ROOT);

        if (repository.existsByStudentIdIgnoreCase(studentId)) {
            throw new DuplicateFieldException("studentId", "Student ID " + studentId + " is already registered");
        }
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateFieldException("email", "Email " + email + " is already registered");
        }

        Student student = new Student();
        apply(student, request, studentId, email);
        return repository.save(student);
    }

    public Student update(Long id, StudentRequest request) {
        Student student = findById(id);
        String studentId = clean(request.studentId());
        String email = clean(request.email()).toLowerCase(Locale.ROOT);

        if (repository.existsByStudentIdIgnoreCaseAndIdNot(studentId, id)) {
            throw new DuplicateFieldException("studentId", "Student ID " + studentId + " is already registered");
        }
        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new DuplicateFieldException("email", "Email " + email + " is already registered");
        }

        apply(student, request, studentId, email);
        return repository.save(student);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("No student with id " + id);
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        long total = repository.count();
        long addedThisWeek = repository.countByCreatedAtAfter(Instant.now().minus(7, ChronoUnit.DAYS));
        return Map.of("total", total, "addedThisWeek", addedThisWeek);
    }

    /** Copies a validated request onto the entity, normalising whitespace. */
    private void apply(Student student, StudentRequest request, String studentId, String email) {
        student.setStudentId(studentId);
        student.setRollNo(clean(request.rollNo()));
        student.setFullName(collapseSpaces(request.fullName()));
        student.setEmail(email);
        student.setPhone(normalisePhone(request.phone()));
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static String collapseSpaces(String value) {
        return clean(value).replaceAll("\\s+", " ");
    }

    /** " +91 98765-43210 " becomes "+919876543210". */
    private static String normalisePhone(String value) {
        String compact = clean(value).replaceAll("[\\s-]", "");
        return compact.startsWith("+") ? "+" + compact.substring(1).replaceAll("\\D", "")
                                       : compact.replaceAll("\\D", "");
    }
}
