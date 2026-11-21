package com.devmate.Services;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;
    private final String model;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model}") String model) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.model = model;
    }

    public String askGemini(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("The prompt is empty.");
        }

        GenerateContentResponse response =
                client.models.generateContent(model, prompt, null);

        String answer = response.text();
        return (answer == null || answer.isBlank())
                ? "Gemini did not return a response."
                : answer;
    }
}