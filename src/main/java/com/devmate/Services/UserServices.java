package com.devmate.Services;


import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServices {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServices(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    // CREATE
    public Users createUser(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        } user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );
        return userRepository.save(user);
    }
    // READ ALL
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // READ ONE
    public Users getUserById(String userID) {
        return userRepository.findById(userID)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // UPDATE
    public Users updateUser(String userID, Users updatedUser) {

        Users existingUser = userRepository.findById(userID)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setRole(updatedUser.getRole());

        return userRepository.save(existingUser);
    }
    // DELETE
    public void deleteUser(String userID) {
        if (!userRepository.existsById(userID)) {
            throw new RuntimeException("User not found" + userID
            );
        }
        userRepository.deleteById(userID);
    }

}
