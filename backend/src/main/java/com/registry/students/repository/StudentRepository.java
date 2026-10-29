package com.registry.students.repository;

import com.registry.students.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentIdIgnoreCase(String studentId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentIdIgnoreCaseAndIdNot(String studentId, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByCreatedAtAfter(Instant since);

    /** Free-text search across every human-readable column. */
    @Query("""
            select s from Student s
            where lower(s.fullName)  like lower(concat('%', :q, '%'))
               or lower(s.studentId) like lower(concat('%', :q, '%'))
               or lower(s.rollNo)    like lower(concat('%', :q, '%'))
               or lower(s.email)     like lower(concat('%', :q, '%'))
               or s.phone            like concat('%', :q, '%')
            """)
    List<Student> search(@Param("q") String q);
}
