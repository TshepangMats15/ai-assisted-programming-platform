
package com.devmate.Services;

import com.devmate.Entities.Users;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class FirebaseUserInsertService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void insertUser(Users user) {

        entityManager.persist(user);
        entityManager.flush();
    }
}
