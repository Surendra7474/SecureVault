package com.securevault.repository;

import com.securevault.entity.PinAttempt;
import com.securevault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PinAttemptRepository extends JpaRepository<PinAttempt, Long> {
    List<PinAttempt> findByUserAndAttemptedAtAfterOrderByAttemptedAtDesc(User user, LocalDateTime since);
    long countByUserAndSuccessAndAttemptedAtAfter(User user, Boolean success, LocalDateTime since);
}
