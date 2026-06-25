import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const RAW_DIR = path.join(process.cwd(), 'images-raw');
const OUTPUT_DIR = path.join(process.cwd(), 'static', 'images');

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
		const targetPath = path.join(OUTPUT_DIR, relativeTarget);

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

				await sharp(sourcePath)
					.webp({ quality: 85 })
					.toFile(targetPath);
				
				const relativeSourceLog = path.relative(process.cwd(), sourcePath);
				const relativeTargetLog = path.relative(process.cwd(), targetPath);
				console.log(`[webp-convert] Optimized: ${relativeSourceLog} -> ${relativeTargetLog}`);
				convertedCount++;
			}
		} catch (error) {
			console.error(`[webp-convert] Failed to convert ${sourcePath}:`, error);
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
