
package AI.Productivity.Platform.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {
                String idToken = header.substring(7).trim();

                if (!idToken.isEmpty()) {
                    FirebaseToken decodedToken =
                            FirebaseAuth.getInstance()
                                    .verifyIdToken(idToken);

                    String firebaseUid = decodedToken.getUid();

                    // Pass the verified Firebase UID to controllers.
                    request.setAttribute("uid", firebaseUid);

                    // Authenticate the user in Spring Security.
                    // This does not assign administrator permissions.
                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    firebaseUid,
                                    null,
                                    List.of(
                                            new SimpleGrantedAuthority(
                                                    "ROLE_USER"
                                            )
                                    )
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();

            // Do not trust a UID when token verification fails.
            request.removeAttribute("uid");
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
