
package AI.Productivity.Platform.service;

import AI.Productivity.Platform.entity.Result;
import AI.Productivity.Platform.repository.ResultRepository;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
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

    // GET RESULTS BELONGING TO THE AUTHENTICATED STUDENT
    public List<Result> getMyResults(String firebaseUid) {

        Users user = requireUser(firebaseUid);

        return resultRepository.findByUserId(
                user.getId()
        );
    }

    // GET ONE STUDENT'S RESULTS FOR A SPECIFIC ASSESSMENT
    public List<Result> getMyAssessmentResults(
            String firebaseUid,
            Integer assessmentId
    ) {
        Users user = requireUser(firebaseUid);

        if (assessmentId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Assessment ID is required."
            );
        }

        return resultRepository.findByUserId(
                user.getId()
        ).stream()
         .filter(result ->
                 assessmentId.equals(result.getAssessmentId())
         )
         .toList();
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
                                "Student account not found."
                        )
                );
    }
}
