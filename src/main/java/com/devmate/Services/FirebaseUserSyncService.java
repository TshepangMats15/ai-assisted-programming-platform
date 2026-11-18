
package com.devmate.Services;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.UserRecord;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class FirebaseUserSyncService {

    private final UserRepository userRepository;
    private final FirebaseUserInsertService insertService;

    public FirebaseUserSyncService(
            UserRepository userRepository,
            FirebaseUserInsertService insertService
    ) {
        this.userRepository = userRepository;
        this.insertService = insertService;
    }

    public enum SyncStatus {
        CREATED,
        ALREADY_EXISTS,
        MISSING_EMAIL,
        EMAIL_CONFLICT,
        DISABLED
    }

    // SYNCHRONIZE ONE FIREBASE USER
    public SyncStatus syncUserByUid(String firebaseUid)
            throws FirebaseAuthException {

        UserRecord firebaseUser =
                FirebaseAuth.getInstance()
                        .getUser(firebaseUid);

        return syncFirebaseUser(firebaseUser);
    }

    // SYNCHRONIZE FIREBASE USER WITH MYSQL
    private SyncStatus syncFirebaseUser(
            UserRecord firebaseUser
    ) {

        String firebaseUid = firebaseUser.getUid();
        String email = firebaseUser.getEmail();
        String displayName = firebaseUser.getDisplayName();

        // Do not import disabled accounts.
        if (firebaseUser.isDisabled()) {
            return SyncStatus.DISABLED;
        }

        // Preserve existing SQL IDs, profiles and roles.
        if (userRepository.findByFirebaseUid(firebaseUid)
                .isPresent()) {

            return SyncStatus.ALREADY_EXISTS;
        }

        // Email is mandatory.
        if (email == null || email.isBlank()) {
            return SyncStatus.MISSING_EMAIL;
        }

        // Prevent incorrect account linking.
        if (userRepository.existsByEmail(email)) {

            // Another request may have inserted this user
            // after the initial UID check.
            if (userRepository.findByFirebaseUid(firebaseUid)
                    .isPresent()) {

                return SyncStatus.ALREADY_EXISTS;
            }

            return SyncStatus.EMAIL_CONFLICT;
        }

        Users user = new Users();

        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);

        user.setFullName(
                displayName != null && !displayName.isBlank()
                        ? displayName
                        : email
        );

        // New users are always students.
        user.setRole(Users.Role.STUDENT.name());

        // Firebase manages authentication credentials.
        user.setPassword(null);

        // Importing a user does not indicate activity.
        user.setLastActive(null);

        try {

            // Insert only. Never merge an existing user.
            insertService.insertUser(user);

            return SyncStatus.CREATED;

        } catch (DataIntegrityViolationException e) {

            // Another request may have inserted the same UID.
            if (userRepository.findByFirebaseUid(firebaseUid)
                    .isPresent()) {

                return SyncStatus.ALREADY_EXISTS;
            }

            // Check for a conflicting email.
            if (userRepository.existsByEmail(email)) {
                return SyncStatus.EMAIL_CONFLICT;
            }

            // Do not hide unrelated database errors.
            throw e;
        }
    }

    // BULK IMPORT ALL EXISTING FIREBASE USERS
    public SyncSummary syncAllFirebaseUsers()
            throws FirebaseAuthException {

        int total = 0;
        int imported = 0;
        int alreadyExists = 0;
        int missingEmail = 0;
        int emailConflicts = 0;
        int disabled = 0;

        ListUsersPage page =
                FirebaseAuth.getInstance()
                        .listUsers(null);

        // Automatically handle Firebase pagination.
        for (ExportedUserRecord firebaseUser :
                page.iterateAll()) {

            total++;

            SyncStatus status =
                    syncFirebaseUser(firebaseUser);

            switch (status) {

                case CREATED -> imported++;

                case ALREADY_EXISTS -> alreadyExists++;

                case MISSING_EMAIL -> missingEmail++;

                case EMAIL_CONFLICT -> emailConflicts++;

                case DISABLED -> disabled++;
            }
        }

        return new SyncSummary(
                total,
                imported,
                alreadyExists,
                missingEmail,
                emailConflicts,
                disabled
        );
    }

    // BULK SYNCHRONIZATION SUMMARY
    public record SyncSummary(
            int total,
            int imported,
            int alreadyExists,
            int missingEmail,
            int emailConflicts,
            int disabled
    ) {
    }
}
