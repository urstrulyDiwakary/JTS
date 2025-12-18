package com.app.util;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FaviconGenerator {
    public static void main(String[] args) throws IOException {
        Path sourcePath = Paths.get("src/main/resources/static/jts.png");
        if (!Files.exists(sourcePath)) {
            System.err.println("Source image not found: " + sourcePath.toAbsolutePath());
            System.exit(1);
        }

        Path outDir = Paths.get("src/main/resources/static/favicons");
        Files.createDirectories(outDir);

        BufferedImage src = ImageIO.read(sourcePath.toFile());
        // Ensure we start from a high-res canvas to reduce aliasing
        BufferedImage srcHi = toARGB(src);

        int[] sizes = new int[]{16, 32, 48, 64, 96, 128, 180, 192, 256, 512};
        for (int s : sizes) {
            BufferedImage resized = resizeHighQuality(srcHi, s, s);
            String baseName = (s == 180) ? "apple-touch-icon-" + s : "jts-" + s;
            File out = outDir.resolve(baseName + ".png").toFile();
            ImageIO.write(resized, "png", out);
            System.out.println("Wrote: " + out.getPath());
        }

        System.out.println("Favicon images generated in: " + outDir.toAbsolutePath());
    }

    private static BufferedImage toARGB(BufferedImage src) {
        if (src.getType() == BufferedImage.TYPE_INT_ARGB) return src;
        BufferedImage argb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = argb.createGraphics();
        g2.setComposite(AlphaComposite.Src);
        g2.drawImage(src, 0, 0, null);
        g2.dispose();
        return argb;
    }

    private static BufferedImage resizeHighQuality(BufferedImage src, int w, int h) {
        BufferedImage dst = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = dst.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_QUALITY);
        g2.setRenderingHint(RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_QUALITY);
        g2.setComposite(AlphaComposite.Src);
        g2.drawImage(src, 0, 0, w, h, null);
        g2.dispose();
        return dst;
    }
}

