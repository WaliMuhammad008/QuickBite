<?php
/**
 * QuickiBite Product Image Optimizer
 * Converts heavy PNG product images to lightweight, modern WebP format
 * while preserving full transparency and alpha channels.
 */

$dir = __DIR__ . '/../uploads/products';
if (!is_dir($dir)) {
    die("Directory not found: {$dir}\n");
}

$files = glob($dir . '/*.{png,PNG}', GLOB_BRACE);
echo "Found " . count($files) . " PNG images in {$dir}\n\n";

$totalOriginal = 0;
$totalWebp = 0;
$converted = 0;

foreach ($files as $file) {
    $filename = basename($file);
    $webpPath = preg_replace('/\.png$/i', '.webp', $file);
    
    $origSize = filesize($file);
    $totalOriginal += $origSize;

    // Load PNG
    $img = @imagecreatefrompng($file);
    if (!$img) {
        echo "  [SKIP] Could not load PNG: {$filename}\n";
        continue;
    }

    // Preserve alpha transparency
    imagepalettetotruecolor($img);
    imagealphablending($img, true);
    imagesavealpha($img, true);

    // Save as WebP with high visual quality (quality: 82)
    if (imagewebp($img, $webpPath, 82)) {
        $webpSize = filesize($webpPath);
        $totalWebp += $webpSize;
        $savedPercent = round((1 - ($webpSize / $origSize)) * 100, 1);
        $converted++;
        echo "  [OK] {$filename} (" . round($origSize / 1024, 1) . " KB) -> " . basename($webpPath) . " (" . round($webpSize / 1024, 1) . " KB) [-{$savedPercent}%]\n";
    } else {
        echo "  [ERROR] Failed to save WebP: {$filename}\n";
    }

    imagedestroy($img);
}

echo "\n=== Summary ===\n";
echo "Converted: {$converted} / " . count($files) . " images\n";
echo "Original total: " . round($totalOriginal / 1024 / 1024, 2) . " MB\n";
echo "WebP total:     " . round($totalWebp / 1024 / 1024, 2) . " MB\n";
$overallReduction = $totalOriginal > 0 ? round((1 - ($totalWebp / $totalOriginal)) * 100, 1) : 0;
echo "Overall size reduction: {$overallReduction}%\n";
