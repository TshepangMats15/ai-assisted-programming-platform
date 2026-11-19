package AI.Productivity.Platform.service;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ResultService {

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    public ResultService(
            ResultRepository resultRepository,
            UserRepository userRepository
    ) {
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    // GET ALL RESULTS FOR ADMINISTRATORS
    public List<Result> getAllResults(String firebaseUid) {

        requireAdmin(firebaseUid);

        return resultRepository.findAll();
    }

    // GET RESULTS BELONGING TO THE AUTHENTICATED STUDENT
    public List<Result> getMyResults(String firebaseUid) {

        Users user = requireUser(firebaseUid);

        return resultRepository.findByUserId(
                user.getId()
        );
    }

    // ADMIN: GET RESULTS FOR A SPECIFIC STUDENT
    public List<Result> getStudentResults(
            String adminUid,
            String studentFirebaseUid
    ) {

        requireAdmin(adminUid);

        Users student = requireUser(studentFirebaseUid);

        return resultRepository.findByUserId(
                student.getId()
        );
    }

    // ADMIN: GET ALL RESULTS FOR A SPECIFIC ASSESSMENT
    public List<Result> getAllAssessmentResults(
            String firebaseUid,
            Integer assessmentId
    ) {

        requireAdmin(firebaseUid);

        validateAssessmentId(assessmentId);

        return resultRepository.findByAssessmentId(
                assessmentId
        );
    }

    // GET ONE STUDENT'S RESULTS FOR AN ASSESSMENT
    public List<Result> getMyAssessmentResults(
            String firebaseUid,
            Integer assessmentId
    ) {

        Users user = requireUser(firebaseUid);

        validateAssessmentId(assessmentId);

        return resultRepository.findByUserId(
                user.getId()
        ).stream()
         .filter(result ->
                 assessmentId.equals(result.getAssessmentId())
         )
         .toList();
    }

    // VERIFY ADMINISTRATOR ROLE
    private void requireAdmin(String firebaseUid) {

        Users user = requireUser(firebaseUid);

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access required."
            );
        }
    }

    // VALIDATE ASSESSMENT ID
    private void validateAssessmentId(Integer assessmentId) {

        if (assessmentId == null || assessmentId <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid assessment ID is required."
            );
        }
    }

    // RESOLVE FIREBASE UID TO INTERNAL MYSQL USER ID
    private Users requireUser(String firebaseUid) {

        if (firebaseUid == null || firebaseUid.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required."
            );
        }

        return userRepository
                .findByFirebaseUid(firebaseUid)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User account not found."
                        )
                );
    }
}