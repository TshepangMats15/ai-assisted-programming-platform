package com.devmate.Repository;

import com.devmate.Entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, String> {

    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);

}

