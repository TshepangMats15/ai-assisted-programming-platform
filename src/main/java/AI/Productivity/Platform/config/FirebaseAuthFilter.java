
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

        SecurityContextHolder.clearContext();

        // Never accept a UID supplied by the client.
        request.removeAttribute("uid");

        String header = request.getHeader("Authorization");

        // No token: continue unauthenticated.
        // Spring Security decides whether the route is public.
        if (header == null || header.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Reject malformed Authorization headers.
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

        try {
            // Verify the token with Firebase Admin SDK.
            FirebaseToken decodedToken =
                    FirebaseAuth.getInstance()
                            .verifyIdToken(idToken);

            String firebaseUid = decodedToken.getUid();

            if (firebaseUid == null || firebaseUid.isBlank()) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Firebase UID is missing."
                );
                return;
            }

            // Only use the UID obtained from the verified token.
            request.setAttribute("uid", firebaseUid);

            // Authenticate the user for Spring Security.
            // ROLE_USER does not grant admin privileges.
            UsernamePasswordAuthenticationToken authentication =
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

            filterChain.doFilter(request, response);

        } catch (com.google.firebase.auth.FirebaseAuthException e) {

            // Token verification failed.
            SecurityContextHolder.clearContext();
            request.removeAttribute("uid");

            if (!response.isCommitted()) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid or expired Firebase ID token."
                );
            }

        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
