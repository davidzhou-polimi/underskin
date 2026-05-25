<script>
    import { tooltip } from '$lib/stores/tooltipState.svelte.js';
</script>

<section class="text-container-section">
    <p class="main-paragraph">
        La pressione cresce fino a trasformarsi in 
        
        <span 
            class="highlight-word"
            role="tooltip"
            tabindex="-1"
            onmouseenter={() => tooltip.show("Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo", "paragrafo")}
            onmouseleave={() => tooltip.hide()}
            onfocus={() => tooltip.show("Ansia della prestazione legata al timore di non riuscire a raggiungere un determinato obiettivo", "paragrafo")}
            onblur={() => tooltip.hide()}
        >
            Fear of Failure
        </span>, 
        
        mentre il bisogno di essere perfetti porta spesso al 
        
        <span 
            class="highlight-word"
            role="tooltip"
            tabindex="-1"
            onmouseenter={() => tooltip.show("PROVA", "semplice")}
            onmouseleave={() => tooltip.hide()}
            onfocus={() => tooltip.show("PROVA", "semplice")}
            onblur={() => tooltip.hide()}
        >
            Choking Under Pressure
        </span>...
    </p>
</section>

<section class="sezione-normale">
    <p>In questa sezione il cursore è quello default e non succede nulla.</p>
</section>