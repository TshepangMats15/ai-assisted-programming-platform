
package com.devmate.Services;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class GeminiImageServices {
    private final Client client;

    public GeminiImageServices(
            @Value("${gemini.api.key}") String apiKey) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }
    public String analyseCodeImage(
            byte[] imageBytes,
            String mimeType,
            String question) throws IOException {

        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException(
                    "The image is empty.");
        }        if (!"image/jpeg".equals(mimeType)
                && !"image/png".equals(mimeType)
                && !"image/webp".equals(mimeType)) {
            throw new IllegalArgumentException("Please upload a JPEG, PNG, or WebP image.");
        }
        String instructions =
                "You are DevMate AI, a programming tutor. "
                        + "Analyse the code visible in this photograph. "
                        + "Transcribe the code when readable, explain what it does, "
                        + "identify visible syntax errors or bugs, and suggest "
                        + "corrections. If the text is unclear, say which parts "
                        + "cannot be read instead of guessing. "
                        + "Use clear explanations suitable for a student.\n\n"
                        + "Student's question: "
                        + (question == null || question.isBlank()
                        ? "Please explain this code and identify any errors."
                        : question);

        Content content = Content.fromParts(
                Part.fromText(instructions),
                Part.fromBytes(imageBytes, mimeType));

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.8-flash", content, null);
        String answer = response.text();
        if (answer == null || answer.isBlank()) {
            return "I couldn't read the code clearly. "
                    + "Please take a clearer picture.";
        }
        return answer;
    }
}



