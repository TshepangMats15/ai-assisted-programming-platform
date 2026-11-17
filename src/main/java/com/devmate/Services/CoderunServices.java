
package com.devmate.Services;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class CoderunServices {

    private static final int MAX_SOURCE_CODE_CHARS = 50_000;
    private static final int MAX_STDIN_CHARS = 10_000;
    private static final int MAX_OUTPUT_CHARS = 20_000;

    private static final int MAX_POLL_ATTEMPTS = 15;
    private static final long POLL_INTERVAL_MS = 1000;

    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
        "java", 62,
        "python", 71,
        "cpp", 54,
        "c++", 54,
        "c", 50,
        "javascript", 63,
        "typescript", 74,
        "csharp", 51,
        "ruby", 72,
        "sql", 82
    );

    private final RestClient client;
    private final String apiKey;
    private final String host;

    public CoderunServices(
        @Value("${judge0.api-key:}") String apiKey,
        @Value("${judge0.url:https://ce.judge0.com}") String baseUrl
    ) {
        String cleanUrl = baseUrl.trim().replaceAll("/+$", "");

        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.host = URI.create(cleanUrl).getHost();

        JdkClientHttpRequestFactory factory =
            new JdkClientHttpRequestFactory(
                HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build()
            );

        factory.setReadTimeout(Duration.ofSeconds(30));

        this.client = RestClient.builder()
            .baseUrl(cleanUrl)
            .requestFactory(factory)
            .build();
    }

    public Map<String, Object> run(
        String language,
        String sourceCode,
        String stdin
    ) {
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new IllegalArgumentException(
                "Please write some code before running it."
            );
        }

        if (sourceCode.length() > MAX_SOURCE_CODE_CHARS) {
            throw new IllegalArgumentException(
                "The code is too long to run."
            );
        }

        if (stdin != null && stdin.length() > MAX_STDIN_CHARS) {
            throw new IllegalArgumentException(
                "The input is too long."
            );
        }

        String key = language == null
            ? ""
            : language.trim().toLowerCase(Locale.ROOT);

        if ("html".equals(key) || "css".equals(key)) {
            throw new IllegalArgumentException(
                "HTML and CSS cannot be executed by Judge0."
            );
        }

        Integer languageId = LANGUAGE_IDS.get(key);

        if (languageId == null) {
            throw new IllegalArgumentException(
                "Unsupported programming language: " + key
            );
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("language_id", languageId);
        payload.put("source_code", sourceCode);
        payload.put("stdin", stdin == null ? "" : stdin);

        // Submit asynchronously. Do not use wait=true.
        Map<String, Object> submission = postSubmission(payload);

        Object tokenValue = submission.get("token");

        if (tokenValue == null ||
            String.valueOf(tokenValue).isBlank()) {
            throw new IllegalStateException(
                "Judge0 did not return a submission token."
            );
        }

        String token = String.valueOf(tokenValue);

        // Poll Judge0 until execution finishes.
        for (int attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(
                    "Code execution was interrupted."
                );
            }

            Map<String, Object> result = getSubmission(token);

            Object statusObject = result.get("status");

            if (!(statusObject instanceof Map<?, ?> statusMap)) {
                continue;
            }

            Object statusId = statusMap.get("id");

            if (!(statusId instanceof Number)) {
                continue;
            }

            int id = ((Number) statusId).intValue();

            // Judge0 status 1 = In Queue, 2 = Processing.
            if (id == 1 || id == 2) {
                continue;
            }

            return formatResult(result);
        }

        throw new IllegalStateException(
            "Code execution is taking too long. Please try again."
        );
    }

    private Map<String, Object> postSubmission(
        Map<String, Object> payload
    ) {
        try {
            Map<String, Object> response = client.post()
                .uri("/submissions?base64_encoded=false&wait=false")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .headers(this::addAuthHeaders)
                .body(payload)
                .retrieve()
                .body(
                    new ParameterizedTypeReference<
                        Map<String, Object>
                    >() {}
                );

            if (response == null) {
                throw new IllegalStateException(
                    "Judge0 returned an empty submission response."
                );
            }

            return response;

        } catch (RestClientResponseException e) {
            throw judge0Error(e);
        }
    }

    private Map<String, Object> getSubmission(String token) {
        try {
            Map<String, Object> response = client.get()
                .uri(
                    "/submissions/{token}?base64_encoded=false",
                    token
                )
                .accept(MediaType.APPLICATION_JSON)
                .headers(this::addAuthHeaders)
                .retrieve()
                .body(
                    new ParameterizedTypeReference<
                        Map<String, Object>
                    >() {}
                );

            if (response == null) {
                throw new IllegalStateException(
                    "Judge0 returned an empty execution response."
                );
            }

            return response;

        } catch (RestClientResponseException e) {
            throw judge0Error(e);
        }
    }

    private void addAuthHeaders(
        org.springframework.http.HttpHeaders headers
    ) {
        if (apiKey.isEmpty()) {
            return;
        }

        if (host != null &&
            host.endsWith("rapidapi.com")) {
            headers.set("X-RapidAPI-Key", apiKey);
            headers.set("X-RapidAPI-Host", host);
        } else {
            headers.set("X-Auth-Token", apiKey);
        }
    }

    private IllegalStateException judge0Error(
        RestClientResponseException e
    ) {
        int statusCode = e.getStatusCode().value();

        if (statusCode == 429) {
            return new IllegalStateException(
                "Judge0 rate limit reached. Please try again later."
            );
        }

        if (statusCode == 401 || statusCode == 403) {
            return new IllegalStateException(
                "Judge0 access denied (HTTP " + statusCode +
                "). Check your RapidAPI subscription, API key, " +
                "and endpoint configuration."
            );
        }

        String details = e.getResponseBodyAsString();

        if (details == null || details.isBlank()) {
            details = "No additional details provided.";
        }

        if (details.length() > 500) {
            details = details.substring(0, 500);
        }

        return new IllegalStateException(
            "Judge0 request failed (HTTP " +
            statusCode + "): " + details
        );
    }

    
private Map<String, Object> formatResult(
        Map<String, Object> body
) {
    String statusText = "Unknown";
    Object statusId = null;

    Object status = body.get("status");

    if (status instanceof Map<?, ?> statusMap) {
        Object description = statusMap.get("description");

        if (description != null) {
            statusText = String.valueOf(description);
        }

        statusId = statusMap.get("id");
    }

    Map<String, Object> result = new LinkedHashMap<>();

    result.put("stdout", clip(body.get("stdout")));
    result.put("stderr", clip(body.get("stderr")));
    result.put(
        "compileOutput",
        clip(body.get("compile_output"))
    );
    result.put("status", statusText);

    // Required for automatic grading
    result.put("statusId", statusId);

    result.put(
        "time",
        body.get("time") == null
            ? ""
            : String.valueOf(body.get("time"))
    );
    result.put("memory", body.get("memory"));

    return result;
}


    private static String clip(Object value) {
        String text = value == null
            ? ""
            : String.valueOf(value);

        if (text.length() <= MAX_OUTPUT_CHARS) {
            return text;
        }

        return text.substring(0, MAX_OUTPUT_CHARS)
            + "\n...output truncated...";
    }
}
