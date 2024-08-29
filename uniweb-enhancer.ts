interface Esame {
    nome: string,
    cfu: number,
    voto: number | null,
    data: string | null,
}

const esami : Esame[] = [];

setTimeout(injectAndParse, 1000);

/**
 * Splits 'Voto' and 'Data' in two different columns,
 * then replaces the label with the grade with an <input> element.
 */
function injectAndParse() {
    // Splitting headers
    const votoHeader = document.getElementById('tableLibrettoth6');
    votoHeader.innerHTML = 'Voto';
    const dataHeader = votoHeader.cloneNode() as HTMLElement;
    dataHeader.id = 'tableLibrettoth61';
    dataHeader.innerHTML = 'Data';
    votoHeader.parentNode.insertBefore(dataHeader, votoHeader.nextElementSibling);

    // Splitting columns in table body and injecting the <input> element
    const tableLibretto = document.getElementById('tableLibretto');
    const tbody = tableLibretto!.children[1].children;
    for (let i = 0; i < tbody.length; i++) {
        const tr = tbody[i];

        const nomeTd = tr.children[0];
        const nome = nomeTd.children[0].innerHTML;

        const cfuTd = tr.children[2];
        const cfu = Number(cfuTd.innerHTML);

        const votoTd = tr.children[5];
        const votoTmp = parseInt(votoTd.innerHTML);
        const voto = Number.isNaN(votoTmp) ? null : votoTmp;

        const dataTd = votoTd.cloneNode() as HTMLElement;
        const data = votoTd.innerHTML.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] || null;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `voto${i}`;
        input.value = voto?.toString() || '';
        input.style.width = '4em';
        input.style.textAlign = 'center';
        input.oninput = (ev) => onChangeVoto(i, <HTMLInputElement> ev.target);

        votoTd.replaceChildren(input);

        const dataNode = document.createTextNode(data || '');
        dataTd.appendChild(dataNode);
        tr.insertBefore(dataTd, votoTd.nextElementSibling);

        esami.push({nome, cfu, voto, data});
    }
    console.log('Uniweb Enhancer Extension loaded!');
    console.log(esami);
}

/**
 * Event Handler: when an <input> element is modified, this validates the grade and updates 'esami' array.
 * @param esameId The id of the exam.
 * @param target The <input> element that triggered the 'change' or 'input' event.
 */
function onChangeVoto(esameId: number, target: HTMLInputElement) {
    const newVotoTmp = parseInt(target.value);
    let newVoto = Number.isNaN(newVotoTmp) || newVotoTmp < 0 ? null : newVotoTmp;
    if (newVoto > 30) newVoto = 30;
    target.value = newVoto?.toString() || '';

    esami[esameId].voto = newVoto;
    updateMedie();
}

function updateMedie() {
    changeMedia(calculateMedia());
    changeMedia(calculateMedia(true), true);
}

/**
 * Calculates the average reading from 'esami' array.
 * @param weighted If true, a weighted average will be returned; if false, the arithmetic one.
 * @returns The requested average.
 */
function calculateMedia(weighted = false) {
    let sum = 0;
    let total = 0;
    for (const esame of esami) {
        if (esame.voto === null) continue;
        const weight = weighted ? esame.cfu : 1;
        sum += esame.voto * weight;
        total += weight;
    }
    return sum / total;
}

/**
 * Updates the average fields in Uniweb UI.
 * @param avg The new average value.
 * @param weighted If true, the weighted average will be updated; if false, the arithmetic one.
 */
function changeMedia(avg: number, weighted = false) {
    const index = weighted ? 1 : 0;

    const boxMedie = document.getElementById('boxMedie');
    const ul = boxMedie.children[0].children;
    const mediaTxt = ul[index].childNodes[2];
    mediaTxt.textContent = ` ${avg.toLocaleString(undefined, {maximumFractionDigits: 3})} / 30`;
}