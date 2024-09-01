interface Exam {
    name: string,
    credits: number,
    grade: number | null,
    date: string | null,
}

const exams : Exam[] = [];

/**
 * Calls injectAndParse() when the page is fully loaded.
 * In particular, when #tableLibretto.style.display mutates to 'none' for the first time.
 */
let initialized = false;
const target = document.getElementById('tableLibretto');
const observer = new MutationObserver(() => {
    if (!initialized && target.style.display !== 'none') {
        injectAndParse();
        initialized = true;
        observer.disconnect();
    }
});
observer.observe(target, { attributes : true, attributeFilter : ['style'] });

/**
 * Splits 'Grade' and 'Exam Date' in two different columns,
 * then replaces the label with the grade with an <input> element.
 */
function injectAndParse() {
    const pageLang = document.documentElement.lang;

    // Splitting headers
    const gradeHeader = document.getElementById('tableLibrettoth6');
    gradeHeader.childNodes[0].textContent = pageLang === 'it' ? 'Voto' : 'Grade';
    const dateHeader = gradeHeader.cloneNode(true) as HTMLElement;
    dateHeader.id = 'tableLibrettoth61';
    dateHeader.childNodes[0].textContent = pageLang === 'it' ? 'Data Esame' : 'Exam Date';
    gradeHeader.parentNode.insertBefore(dateHeader, gradeHeader.nextElementSibling);

    // Splitting columns in table body and injecting the <input> element
    const bookletTable = document.getElementById('tableLibretto');
    const tbody = bookletTable!.children[1].children;
    for (let i = 0; i < tbody.length; i++) {
        const tr = tbody[i];

        const nameTd = tr.children[0];
        const name = nameTd.children[0].innerHTML;

        const creditsTd = tr.children[2];
        const credits = Number(creditsTd.innerHTML);

        const gradeTd = tr.children[5];
        const gradeTmp = parseInt(gradeTd.innerHTML);
        const grade = Number.isNaN(gradeTmp) ? null : gradeTmp;

        const dateTd = gradeTd.cloneNode() as HTMLElement;
        const date = gradeTd.innerHTML.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] || null;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `grade${i}`;
        input.value = grade?.toString() || '';
        input.style.width = '4em';
        input.style.textAlign = 'center';
        input.oninput = (ev) => onChangeGrade(i, <HTMLInputElement> ev.target);

        gradeTd.replaceChildren(input);

        const dateNode = document.createTextNode(date || '');
        dateTd.appendChild(dateNode);
        tr.insertBefore(dateTd, gradeTd.nextElementSibling);

        exams.push({name, credits, grade, date});
    }
    console.log('Uniweb Enhancer Extension loaded!');
    console.log(exams);
}

/**
 * Event Handler: when an <input> element is modified, this validates the grade and updates 'exams' array.
 * @param examId The id of the exam.
 * @param target The <input> element that triggered the 'change' or 'input' event.
 */
function onChangeGrade(examId: number, target: HTMLInputElement) {
    const newGradeTmp = parseInt(target.value);
    let newGrade = Number.isNaN(newGradeTmp) || newGradeTmp < 0 ? null : newGradeTmp;
    if (newGrade > 30) newGrade = 30;
    target.value = newGrade?.toString() || '';

    exams[examId].grade = newGrade;
    updateAverages();
}

function updateAverages() {
    changeAverage(calculateAverage());
    changeAverage(calculateAverage(true), true);
}

/**
 * Calculates the average reading from 'exams' array.
 * @param weighted If true, a weighted average will be returned; if false, the arithmetic one.
 * @returns The requested average.
 */
function calculateAverage(weighted = false) {
    let sum = 0;
    let total = 0;
    for (const exam of exams) {
        if (exam.grade === null) continue;
        const weight = weighted ? exam.credits : 1;
        sum += exam.grade * weight;
        total += weight;
    }
    return sum / total;
}

/**
 * Updates the average fields in Uniweb UI.
 * @param avg The new average value.
 * @param weighted If true, the weighted average will be updated; if false, the arithmetic one.
 */
function changeAverage(avg: number, weighted = false) {
    const index = weighted ? 1 : 0;

    const averagesBox = document.getElementById('boxMedie');
    const ul = averagesBox.children[0].children;
    const averageTxt = ul[index].childNodes[2];
    averageTxt.textContent = ` ${avg.toLocaleString(undefined, {maximumFractionDigits: 3})} / 30`;
}