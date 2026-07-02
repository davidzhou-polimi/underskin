import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const RAW_DIR = path.join(process.cwd(), 'images-raw');
const OUTPUT_DIR = path.join(process.cwd(), 'static', 'images');

// Directory (relative a images-raw) che producono varianti responsive per srcset.
// I valori sono larghezze immagine (coerenti coi descrittori `w` dello srcset):
// 800 copre le card attuali a DPR 1–2, 1600 DPR 3 e full-bleed su telefono,
// 1920 un futuro full-bleed su tablet ad alta densità (~834 CSS px × DPR 2).
const RESPONSIVE_DIRS = {
	team: { widths: [800, 1600, 1920], quality: 80 }
};

// Recursively walks the directory to find all image files
function getFilesRecursively(dir) {
	let results = [];
	if (!fs.existsSync(dir)) return results;
	
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			results = results.concat(getFilesRecursively(filePath));
		} else {
			results.push(filePath);
		}
	});

	return results;
}

async function convertImages() {
	if (!fs.existsSync(RAW_DIR)) {
		console.warn(`[webp-convert] Raw source directory not found: ${RAW_DIR}`);
		return;
	}

	const files = getFilesRecursively(RAW_DIR);
	const imageExtensions = /\.(jpe?g|png)$/i;

	const candidates = files.filter((file) => imageExtensions.test(file));
	let convertedCount = 0;

	for (const sourcePath of candidates) {
		const relativePath = path.relative(RAW_DIR, sourcePath);
		const ext = path.extname(relativePath);
		const relativeTarget = relativePath.replace(new RegExp(`${ext}$`), '.webp');
		const topDir = relativePath.split(path.sep)[0];
		const responsive = RESPONSIVE_DIRS[topDir] ?? null;

		// Ogni entry è { targetPath, width, quality }: width null = dimensione originale (nessun resize)
		const outputs = responsive
			? responsive.widths.map((width) => ({
					targetPath: path.join(
						OUTPUT_DIR,
						relativeTarget.replace(/\.webp$/, `-${width}.webp`)
					),
					width,
					quality: responsive.quality ?? 85
				}))
			: [{ targetPath: path.join(OUTPUT_DIR, relativeTarget), width: null, quality: 85 }];

		for (const { targetPath, width, quality } of outputs) {
			try {
				const sourceStat = fs.statSync(sourcePath);
				let shouldConvert = true;

				if (fs.existsSync(targetPath)) {
					const targetStat = fs.statSync(targetPath);
					// Avoid re-compressing already optimized images to keep the build process fast
					if (targetStat.mtimeMs >= sourceStat.mtimeMs) {
						shouldConvert = false;
					}
				}

				if (shouldConvert) {
					const targetDir = path.dirname(targetPath);
					if (!fs.existsSync(targetDir)) {
						fs.mkdirSync(targetDir, { recursive: true });
					}

					let pipeline = sharp(sourcePath)
						// Orient the image based on EXIF metadata (crucial for smartphone/camera uploads)
						.rotate();

					if (width) {
						// Vincola la sola larghezza (coerente col descrittore `w` dello srcset);
						// withoutEnlargement evita upscaling se l'originale è più piccolo della variante
						pipeline = pipeline.resize({
							width,
							withoutEnlargement: true
						});
					}

					await pipeline.webp({ quality }).toFile(targetPath);

					const relativeSourceLog = path.relative(process.cwd(), sourcePath);
					const relativeTargetLog = path.relative(process.cwd(), targetPath);
					console.log(`[webp-convert] Optimized: ${relativeSourceLog} -> ${relativeTargetLog}`);
					convertedCount++;
				}
			} catch (error) {
				console.error(`[webp-convert] Failed to convert ${sourcePath}:`, error);
			}
		}
	}

	if (convertedCount > 0) {
		console.log(`[webp-convert] Successfully optimized ${convertedCount} image(s).`);
	} else {
		console.log('[webp-convert] All images up to date.');
	}
}

convertImages().catch((err) => {
	console.error('[webp-convert] Fatal error in conversion script:', err);
	process.exit(1);
});
