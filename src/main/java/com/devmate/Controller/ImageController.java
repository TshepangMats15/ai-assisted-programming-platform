
package com.devmate.Controller;

import com.devmate.Services.GeminiImageServices;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ImageController {
    private final GeminiImageServices imageServices;

    public ImageController(
            GeminiImageServices imageServices) {
        this.imageServices = imageServices;
    }

    @PostMapping(
            value = "/analyse-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> analyseImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(
                    value = "question",
                    required = false
            ) String question) {

        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Please upload a picture."));
        }

        if (image.getSize() > 8 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Please use an image smaller than 8 MB."));
        }

        String contentType = image.getContentType();

        if (contentType == null
                || !(contentType.equals("image/jpeg")
                || contentType.equals("image/png")
                || contentType.equals("image/webp"))) {

            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Only JPEG, PNG, and WebP images are supported."));
        }
        try {
            String answer = imageServices.analyseCodeImage(
                    image.getBytes(),
                    contentType,
                    question);

            return ResponseEntity.ok(
                    Map.of("analysis", answer));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Could not read the uploaded image."));
        } catch (Exception e) {
            System.err.println("Image analysis failed: "
                            + e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Image analysis failed. Check the backend logs."));
        }
    }
}
