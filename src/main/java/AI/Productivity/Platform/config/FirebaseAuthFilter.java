
package AI.Productivity.Platform.config;

import com.devmate.Entities.Users;
import com.devmate.Repository.UserRepository;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public FirebaseAuthFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        SecurityContextHolder.clearContext();
        request.removeAttribute("uid");

        // Allow CORS preflight requests.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        // Spring Security handles unauthenticated requests.
        if (header == null || header.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!header.startsWith("Bearer ")) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid Authorization header."
            );
            return;
        }

        String idToken = header.substring(7).trim();

        if (idToken.isEmpty()) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Firebase ID token is missing."
            );
            return;
        }

        FirebaseToken decodedToken;

        try {

            // Verify token, revocation and disabled account status.
            decodedToken = FirebaseAuth.getInstance()
                    .verifyIdToken(idToken, true);

        } catch (FirebaseAuthException e) {

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Firebase authentication failed."
            );
            return;
        }

        String firebaseUid = decodedToken.getUid();

        if (firebaseUid == null || firebaseUid.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Firebase UID is missing."
            );
            return;
        }

        try {

            Optional<Users> databaseUser =
                    userRepository.findByFirebaseUid(firebaseUid);

            List<SimpleGrantedAuthority> authorities =
                    new ArrayList<>();

            // Every verified Firebase identity receives ROLE_USER.
            authorities.add(
                    new SimpleGrantedAuthority("ROLE_USER")
            );

            if (databaseUser.isPresent()) {

                String role = databaseUser.get().getRole();

                // Only accept recognized database roles.
                if ("ADMIN".equalsIgnoreCase(role)) {

                    authorities.add(
                            new SimpleGrantedAuthority("ROLE_ADMIN")
                    );

                } else if ("STUDENT".equalsIgnoreCase(role)) {

                    authorities.add(
                            new SimpleGrantedAuthority("ROLE_STUDENT")
                    );

                } else {

                    response.sendError(
                            HttpServletResponse.SC_FORBIDDEN,
                            "Invalid account role."
                    );
                    return;
                }

            } else {

                // Unsynchronized users may only access synchronization.
                boolean syncRequest =
                        "POST".equalsIgnoreCase(request.getMethod())
                        && "/api/users/sync".equals(
                                request.getServletPath()
                        );

                if (!syncRequest) {
                    response.sendError(
                            HttpServletResponse.SC_FORBIDDEN,
                            "User synchronization required."
                    );
                    return;
                }
            }

            request.setAttribute("uid", firebaseUid);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            firebaseUid,
                            null,
                            authorities
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            filterChain.doFilter(request, response);

        } finally {

            SecurityContextHolder.clearContext();
            request.removeAttribute("uid");
        }
    }
}
