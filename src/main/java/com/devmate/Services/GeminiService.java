package com.devmate.Services;

import com.google.genai.Client;
import com.google.genai.gaos.models.interactions.CreateModelInteraction;
import com.google.genai.gaos.models.interactions.Interaction;
import com.google.genai.gaos.models.interactions.InteractionsInput;
import com.google.genai.gaos.models.interactions.Model;
import com.google.genai.gaos.models.operations.CreateInteractionRequestBody;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {
    private final Client client;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String askGemini(String prompt) {
        CreateModelInteraction params =
                CreateModelInteraction.builder()
                        .model(Model.of("gemini-3.8-flash"))
                        .input(InteractionsInput.of("Hello, how may I help you today?"))
                        .build();
        Interaction interaction =
                client.interactions.create(CreateInteractionRequestBody.of(params)).interaction().get();
        return interaction.outputText().orElse("Gemini did not return a response.");
    }
}

