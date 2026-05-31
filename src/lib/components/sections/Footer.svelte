<script>
	// Commento solo il PERCHÉ: Importa l'azione fadeUp per applicare una transizione di
	// ingresso fluida al montaggio del componente.
	import { fadeUp } from '$lib/actions/fadeUp.js';
</script>

<footer class="hero-footer" use:fadeUp={{ duration: 1.2, delay: 0.1, y: 30 }}>
	<div class="footer-container">
		<div class="footer-brand">UnderSkin</div>
		<div class="footer-bottom">
			<span class="footer-text">Laboratorio di Web e Digital Design, a.a. 2026/27</span>
			<span class="footer-text">© 2026</span>
		</div>
	</div>
</footer>

<style>
	/* Commento solo il PERCHÉ: Posiziona il footer nel flusso relativo del documento 
	   in modo che si collochi al fondo di tutta la pagina (sotto lo scroll-spacer) e non sovrapposto. */
	.hero-footer {
		position: relative;
		padding-inline: var(--spacing-6);
		padding-block-end: var(--spacing-6);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 2;
		background: transparent;
	}

	/* Commento solo il PERCHÉ: Contenitore flessibile che si restringe alla larghezza dell'elemento
	   più largo (la scritta brand 3xl) per costringere il blocco dei metadati ad allinearsi ad essa. */
	.footer-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: fit-content;
		max-width: 100%;
	}

	/* Commento solo il PERCHÉ: Applica la dimensione 3xl dedicata al brand name con
	   interlinea ridotta e crenatura stretta per un forte impatto editoriale. */
	.footer-brand {
		font-size: var(--text-footer-size);
		font-weight: var(--text-footer-weight);
		color: var(--content-dark-primary);
		line-height: 0.85;
		text-transform: uppercase;
		letter-spacing: -0.02em;
		text-align: center;
		width: 100%;
		user-select: none;
	}

	/* Commento solo il PERCHÉ: Distribuisce gli elementi secondari del footer alle due estremità
	   opposte occupando l'esatta larghezza del contenitore padre (il testo "UnderSkin"). */
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-block-start: var(--spacing-3);
	}

	/* Commento solo il PERCHÉ: Utilizza lo stile di testo secondario e di dimensioni ridotte
	   definito nei token di tipografia per le note informative. */
	.footer-text {
		font-size: var(--text-service-size);
		font-weight: var(--text-service-weight);
		color: var(--content-dark-primary);
	}

	/* Commento solo il PERCHÉ: Adatta il font gigante "UnderSkin" sui dispositivi mobili 
	   per evitare l'overflow orizzontale e impila i testi di metadati verticalmente. */
	@media (max-width: 768px) {
		.footer-brand {
			font-size: var(--text-2xl);
		}
		.footer-bottom {
			flex-direction: column;
			align-items: center;
			gap: var(--spacing-2);
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.footer-brand {
			font-size: var(--text-xl);
		}
	}
</style>
