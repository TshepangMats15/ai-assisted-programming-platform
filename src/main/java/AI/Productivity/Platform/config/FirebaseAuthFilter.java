package AI.Productivity.Platform.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Never block HTTP OPTIONS preflight requests for CORS!
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Allow public auth, mobile submissions, and development endpoints
        if (path.startsWith("/api/auth/") ||
            path.startsWith("/api/submissions") ||
            path.startsWith("/api/results") ||
            path.startsWith("/api/assessments") ||
            path.startsWith("/api/coursework") ||
            path.startsWith("/api/ai") ||
            path.startsWith("/api/gemini") ||
            path.startsWith("/api/analytics") ||
            path.startsWith("/api/users") ||
            path.equals("/hello")) {

            // If an Authorization header is present, decode it to populate user attribute
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    String token = header.substring(7);
                    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                    request.setAttribute("uid", decodedToken.getUid());
                } catch (Exception e) {
                    // Continue gracefully for dev endpoints
                }
            }
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = header.substring(7);
        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            request.setAttribute("uid", decodedToken.getUid());
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase token: " + e.getMessage());
        }
    }
}