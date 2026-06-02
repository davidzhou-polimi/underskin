import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Svelte Action per gestire l'animazione di scrollytelling di Outro.svelte.
 * Coordina il posizionamento del titolo, la comparsa del cerchio e la transizione dei 5 stadi.
 * 
 * @param {HTMLElement} node - La scena (.scene) in cui si trovano gli elementi da animare
 */
export function outroScrollAnimation(node) {
    const title = node.querySelector('.podium-title');
    const circleStage = node.querySelector('.circle-stage');
    const percentageText = /** @type {SVGTextElement} */ (node.querySelector('.circle-percentage'));
    const revealCircle = node.querySelector('.reveal-circle');
    const descriptionText = /** @type {SVGTextElement} */ (node.querySelector('.circle-description'));

    // Guard: verify all elements exist
    if (!title || !circleStage || !percentageText || !revealCircle || !descriptionText) {
        return {
            destroy() {}
        };
    }

    // Il trigger per lo scorrimento è la sezione intera che racchiude la scena sticky
    const triggerElement = node.closest('section') || node;

    // Stadi delle statistiche definiti per lo storytelling
    const stages = [
        { target: 34, lines: ['soffre di ansia o depressione'] },
        { target: 45, lines: ['manifesta disturbi alimentari'] },
        { target: 26, lines: ['sviluppa problemi mentali', 'gravi dopo il ritiro'] },
        { target: 36, lines: ['soffre di disturbi del sonno'] },
        { target: 53, lines: ['soffre di solitudine'] }
    ];

    /**
     * Svuota e ripopola l'elemento di descrizione SVG con elementi tspan per gestire l'andata a capo.
     * 
     * @param {SVGTextElement} element - L'elemento SVG <text>
     * @param {string[]} lines - Le righe di testo da inserire
     */
    function updateDescriptionText(element, lines) {
        element.innerHTML = '';
        lines.forEach((line, i) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', '235.5');
            tspan.setAttribute('dy', i === 0 ? '0' : '1.3em');
            tspan.textContent = line;
            element.appendChild(tspan);
        });
    }

    const ctx = gsap.context(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });

        // Impostiamo gli stati iniziali in modo pulito all'avvio
        gsap.set(circleStage, { opacity: 0 });
        gsap.set(percentageText, { textContent: '0%' });
        revealCircle.setAttribute('stroke-dasharray', '0 100');
        
        // Inizializziamo il testo del primo stadio ma teniamo l'opacità a 0
        updateDescriptionText(descriptionText, stages[0].lines);
        gsap.set(descriptionText, { opacity: 1 });

        // 1. Spostamento del titolo dal centro dello schermo alla sua posizione finale (top: var(--spacing-11))
        tl.to(title, {
            top: 'var(--spacing-11)',
            yPercent: 0,
            ease: 'power1.inOut',
            duration: 1.5
        });

        // 2. Compariamo in dissolvenza il cerchio delle statistiche
        tl.to(circleStage, {
            opacity: 1,
            duration: 0.8
        }, '+=0.2');

        // 3. Primo stadio (0 -> 34%)
        const step0Obj = { value: 0 };
        tl.to(step0Obj, {
            value: stages[0].target,
            duration: 1.2,
            ease: 'power1.out',
            onUpdate() {
                percentageText.textContent = `${Math.round(step0Obj.value)}%`;
                const reveal = step0Obj.value;
                revealCircle.setAttribute('stroke-dasharray', `${reveal.toFixed(2)} ${100 - reveal}`);
            }
        });

        // Pausa di lettura per il primo stadio
        tl.to({}, { duration: 1.0 });

        // 4. Ciclo per i successivi 4 stadi
        for (let i = 1; i < stages.length; i++) {
            const currentStage = stages[i];
            const prevStage = stages[i - 1];
            
            // Sfocatura o dissolvenza della descrizione prima di cambiarla
            tl.to(descriptionText, { opacity: 0, duration: 0.3 });
            
            // Cambiamo il testo delle righe descrizione
            tl.call(() => {
                updateDescriptionText(descriptionText, currentStage.lines);
            });
            
            // Rivelazione in dissolvenza della nuova descrizione
            tl.to(descriptionText, { opacity: 1, duration: 0.3 });
            
            // Transizione della percentuale e del tracciato del cerchio verso il nuovo target
            const stepObj = { value: prevStage.target };
            tl.to(stepObj, {
                value: currentStage.target,
                duration: 1.2,
                ease: 'power1.out',
                onUpdate() {
                    percentageText.textContent = `${Math.round(stepObj.value)}%`;
                    const reveal = stepObj.value;
                    revealCircle.setAttribute('stroke-dasharray', `${reveal.toFixed(2)} ${100 - reveal}`);
                }
            }, '-=0.3'); // Avviamo leggermente prima della fine della dissolvenza testo per fluidità
            
            // Pausa di lettura per questo stadio
            tl.to({}, { duration: 1.0 });
        }

        // 5. Dissolvenza finale di chiusura della scena all'avvicinarsi del termine dello scroll
        tl.to([circleStage, title], {
            opacity: 0,
            duration: 1.0
        }, '+=0.5');

    }, node);

    return {
        destroy() {
            ctx.revert();
        }
    };
}
