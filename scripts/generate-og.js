import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve('scripts');
// I TTF sorgente vivono in scripts/fonts (fontconfig non legge WOFF2);
// il sito pubblica solo i WOFF2 in static/fonts.
const FONTS_DIR = path.resolve('scripts/fonts');
const CACHE_DIR = path.resolve('.gemini/fontconfig-cache');
const FONTS_CONF_PATH = path.join(SCRIPTS_DIR, 'fonts.conf');

if (!fs.existsSync(SCRIPTS_DIR)) {
	fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}
if (!fs.existsSync(CACHE_DIR)) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Generiamo dinamicamente il file fonts.conf usando i percorsi assoluti reali del file system
const fontsConfContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTS_DIR}</dir>
  <cachedir>${CACHE_DIR}</cachedir>
</fontconfig>
`;

fs.writeFileSync(FONTS_CONF_PATH, fontsConfContent, 'utf-8');

// Configura la variabile d'ambiente FONTCONFIG_PATH prima di caricare sharp
process.env.FONTCONFIG_PATH = SCRIPTS_DIR;

// Importiamo sharp dopo aver impostato FONTCONFIG_PATH
import sharp from 'sharp';

const TEMPLATE_PATH = path.resolve('scripts/og-template.svg');
const OUTPUT_DIR = path.resolve('static/images/og');
const BG_PATH = path.join(SCRIPTS_DIR, 'bg-share.png');
// JPEG invece di PNG: l'anteprima social è piccola e il JPEG di qualità gestisce bene
// i gradienti — stesso risultato percepito a ~1/10 del peso (i crawler non supportano WebP).
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'share.jpg');

async function generateSingleImage() {
	// Commento solo il PERCHÉ: rimuove i vecchi file di anteprima generati in precedenza (es. favorito.png, about.png)
	// per evitare di lasciare file orfani inutilizzati all'interno della cartella degli asset statici.
	if (fs.existsSync(OUTPUT_DIR)) {
		fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
	}
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	if (!fs.existsSync(BG_PATH)) {
		console.error(`❌ Sfondo per la condivisione non trovato al percorso ${BG_PATH}.`);
		return;
	}

	const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

	// Generiamo un'unica immagine con titolo "UnderSkin" per la condivisione ufficiale
	const svgContent = template.replace(/{TITLE}/g, 'UnderSkin');

	try {
		const svgBuffer = Buffer.from(svgContent);

		// Composizione dell'SVG trasparente con il titolo sopra lo screenshot del gradiente:
		// lo sfondo deve essere già pulito (senza scrollbar ai bordi), il titolo è centrato
		// dal template SVG indipendentemente dallo sfondo.
		await sharp(BG_PATH)
			.resize(1200, 630)
			.composite([{ input: svgBuffer }])
			.jpeg({ quality: 88 })
			.toFile(OUTPUT_FILE);

		console.log(`✅ Immagine di anteprima ufficiale generata con successo -> share.jpg`);
	} catch (error) {
		console.error(`❌ Errore durante la generazione dell'immagine di condivisione:`, error);
	}
}

generateSingleImage();
