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

    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
            "java", 62,
            "python", 71,
            "cpp", 54,
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
        @Value("${judge0.url:https://ce.judge0.com}") String baseUrl) {

        String cleanUrl = baseUrl.replaceAll("/+$", "");

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
            String stdin) {

        // Validate source code
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new IllegalArgumentException("Please write some code before running it.");
        }

        if (sourceCode.length() > MAX_SOURCE_CODE_CHARS) {
            throw new IllegalArgumentException("The code is too long to run.");
        }

        if (stdin != null && stdin.length() > MAX_STDIN_CHARS) {
            throw new IllegalArgumentException( "The input is too long.");
        }

        // Validate language
        String key = language == null
                ? ""
                : language.trim().toLowerCase(Locale.ROOT);

        if (key.equals("html") || key.equals("css")) {
            throw new IllegalArgumentException("HTML and CSS cannot be run here. Open the file in a browser to preview it.");
        }

        Integer languageId = LANGUAGE_IDS.get(key);

        if (languageId == null) {
            throw new IllegalArgumentException("Please choose a programming language before running your code.");
        }

        // Prepare Judge0 request
        Map<String, Object> payload = new LinkedHashMap<>();

        payload.put("language_id", languageId);
        payload.put("source_code", sourceCode);

        if (stdin != null && !stdin.isEmpty()) {
            payload.put("stdin", stdin);
        }

        payload.put("cpu_time_limit", 5);
        payload.put("wall_time_limit", 10);
        payload.put("memory_limit", 128000);

        // Send request to Judge0
        Map<String, Object> body;

        try {

            body = client.post()
                    .uri("/submissions?base64_encoded=false&wait=true")
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> {

                        if (!apiKey.isEmpty()) {

                            if (host != null && host.contains("rapidapi.com")) {
                                headers.set("X-RapidAPI-Key", apiKey);
                                headers.set("X-RapidAPI-Host", host);
                            } else {
                                headers.set("X-Auth-Token", apiKey);
                            }
                        }

                    })
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        } catch (RestClientResponseException e) {

            if (e.getStatusCode().value() == 429) {
                throw new IllegalStateException( "The code runner is busy right now. Please try again in a moment.");
            }

            throw new IllegalStateException("The code runner returned an error (" + e.getStatusCode().value() + ").");
        }

        if (body == null) {
            throw new IllegalStateException("The code runner returned an empty response.");
        }

        // Extract execution status
        String statusText = "Unknown";

        Object status = body.get("status");

        if (status instanceof Map<?, ?> statusMap && statusMap.get("description") != null) {

            statusText = String.valueOf(statusMap.get("description"));
        }

        // Prepare response
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("stdout", clip(body.get("stdout")));
        result.put("stderr", clip(body.get("stderr")));
        result.put("compileOutput", clip(body.get("compile_output")));
        result.put("status", statusText);

        result.put("time", body.get("time") == null ? "" : String.valueOf(body.get("time")));

        result.put("memory", body.get("memory"));
        return result;
    }

    // Prevent excessively large execution output
    private static String clip(Object value) {

        String text = value == null ? "" : String.valueOf(value);

        return text.length() <= MAX_OUTPUT_CHARS ? text : text.substring(0, MAX_OUTPUT_CHARS)  + "\n...output truncated...";
    }
}
