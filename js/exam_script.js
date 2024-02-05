import schema_utils from "../utils/schema_utils.js";
import dom_utils from "../utils/dom_utils.js";

const examModal = document.getElementById('exam-modal')
const questionCtn = document.getElementById('question-ctn') 
const questionsCtn = document.querySelector('.questions-ctn')
const optionsCtn = document.getElementById('options-ctn') 
const circlesCtn = document.getElementById('circles-ctn') 
const ciclesModal = document.getElementById('circle-modal')
const circlesModalCtn = document.getElementById('circles-modal-ctn')
const nextButton = document.getElementById('next-btn') 
const previousButton = document.getElementById('previous-btn') 
const correctMarker = document.getElementById('correct-marker')
const errorMarker = document.getElementById('error-marker')
const totalMarker = document.getElementById('total-marker')
const remakeButton = document.getElementById('remake-q-btn')
const questionImageButtonCtn = document.getElementById('img-button-ctn')
const questionImageButton = document.getElementById('display-img-modal-button')
const imageModal = document.getElementById('img-modal')
const questionImage = document.getElementById('question-img')
const closeImageModalButton = document.getElementById('img-modal-close-button')
const questionOriginText = document.getElementById('origin-text')
const getBackButton = document.getElementById('get-back-button')
const questionErrorMessage = document.getElementById('question-error-message')

let TOTAL = 0
let CORRECTAS = 0
let ERRORES = 0
let PREGUNTAS = []
let doneQuestions = []
let counter = 0

function displayExam(allQuestions) {
    while (circlesCtn.firstChild) circlesCtn.removeChild(circlesCtn.firstChild)
    while (circlesModalCtn.firstChild) circlesModalCtn.removeChild(circlesModalCtn.firstChild)
    examModal.classList.add('flex-active')

    let customCounter = 1
    allQuestions = allQuestions.map(q => {
        q['custom-index'] = customCounter
        customCounter++
        return q
    })

    TOTAL = 0
    CORRECTAS = 0
    ERRORES = 0
    PREGUNTAS = allQuestions
    doneQuestions = []
    counter = 0

    for (let i = 1; i <= PREGUNTAS.length; i++) {
        const CIRCLE = document.createElement('div');
        CIRCLE.classList.add('circle-neutral-ctn');
        CIRCLE.id = i
        CIRCLE.textContent = i;
        CIRCLE.addEventListener('click', (e) => {
            counter = parseInt(e.target.id) - 1
            checkIfDonned(counter)
        })
        circlesCtn.appendChild(CIRCLE);

        const MODAL_CIRCLE = document.createElement('div')
        MODAL_CIRCLE.classList.add('circle-neutral-ctn');
        MODAL_CIRCLE.id = `modal-${i}`
        MODAL_CIRCLE.textContent = i;
        MODAL_CIRCLE.addEventListener('click', (e) => {
            counter = parseInt(e.target.textContent) - 1
            checkIfDonned(counter)
            ciclesModal.classList.remove('flex-active')
        })
        circlesModalCtn.appendChild(MODAL_CIRCLE);
    }

    customMarker(undefined, true)

    showQuestion(counter, false)
}

function nextQuestionHandler(e){
    e.stopPropagation()
    counter = manageCounter(counter, true)
    checkIfDonned(counter)
}

function previousQuestionHandler(e){
    e.stopPropagation()
    counter = manageCounter(counter, false)
    checkIfDonned(counter)
}

function manageCounter(counter, nextBool){
    if (nextBool == true && counter < PREGUNTAS.length - 1) { return counter + 1 }
    else if (nextBool == true && counter == PREGUNTAS.length - 1){ return 0 }
    else if (nextBool == false && counter > 0){ return counter - 1 }
    else if (nextBool == false && counter == 0){ return PREGUNTAS.length - 1 }
}

function showQuestion(index, disable, choosen=undefined){
    let indexNum = index + 1
    questionCtn.textContent = ''
    optionsCtn.textContent = ''
    questionCtn.textContent = `${PREGUNTAS[index]['custom-index']}) ${PREGUNTAS[index]['question']}`
    questionOriginText.textContent = `Examen unico ${PREGUNTAS[index]['origin']['exam']}, pregunta ${PREGUNTAS[index]['index']}), tema 'A'`

    if (PREGUNTAS[index]['image'] == '') {
        if (questionImageButtonCtn.classList.contains('flex-active')) questionImageButtonCtn.classList.remove('flex-active')
    } else {
        questionImageButtonCtn.classList.add('flex-active')
        questionImage.setAttribute('src', `img/${PREGUNTAS[index]['image']}.png`)
    }

    // Circle Bar scroll Handler
    if (document.querySelector('.circle-actual')) document.querySelector('.circle-actual').classList.remove('circle-actual')
    const circleActual = document.getElementById(indexNum)
    circleActual.classList.add('circle-actual')
    const contenidoWidth = circlesCtn.scrollWidth;
    const contenedorWidth = circlesCtn.clientWidth;
    const barrasDeslizadorasActivas = contenidoWidth > contenedorWidth;
    if (barrasDeslizadorasActivas) {
        circlesCtn.scrollLeft = circleActual.offsetLeft - contenedorWidth / 2
    }

    function optionClickHandler(e) {
        doneQuestions.push({
            'index': indexNum,
            'choosen': e.target.id,
            'correct': PREGUNTAS[index]['answer'].toLowerCase()
        })
        if (PREGUNTAS[index]['answer'].toLowerCase() == e.target.id){
            e.target.classList.add('option-correct')
            document.getElementById(indexNum).classList.add('circle-correct')
            document.getElementById(`modal-${indexNum}`).classList.add('circle-correct')
            customMarker(true)
        }
        else {
            e.target.classList.add('option-error');
            document.getElementById(PREGUNTAS[index]['answer'].toLowerCase()).classList.add('option-correct');
            document.getElementById(`${indexNum}`).classList.add('circle-error');
            document.getElementById(`modal-${indexNum}`).classList.add('circle-error')
            customMarker(false)
        }
        createBlackOut()
    }
    
    for (let letter of ['a', 'b', 'c', 'd']){
        let option = document.createElement('div')
        option.className = 'option'
        option.id = letter
        option.textContent = `${letter}) ${PREGUNTAS[index]['options'][letter]}`
        option.addEventListener('touchstart', optionClickHandler) // Para la version 'Mobile'
        option.addEventListener('click', optionClickHandler)
        optionsCtn.appendChild(option)
    }


    questionErrorMessage.textContent = ''
    if (PREGUNTAS[index]['answer'] == 'invalid') {
        createBlackOut('Pregunta oficialmente invalidada')
    } else if (!['a', 'b', 'c', 'd', 'invalid'].includes(PREGUNTAS[index]['answer'])) {
        createBlackOut('Pregunta incompleta')
    }
    if (disable) {
        createBlackOut()
        document.getElementById(PREGUNTAS[index]['answer'].toLowerCase()).classList.add('option-correct')
        if (PREGUNTAS[index]['answer'].toLowerCase() !== choosen) document.getElementById(choosen).classList.add('option-error')
    }
}

function customMarker(correctBool, reset=false) {
    if (reset) {
        correctMarker.textContent = CORRECTAS
        errorMarker.textContent = ERRORES
        totalMarker.textContent = TOTAL
        return;
    }
    if (correctBool) {
        CORRECTAS++
        correctMarker.textContent = CORRECTAS
    } else {
        ERRORES++
        errorMarker.textContent = ERRORES
    }
    TOTAL++
    totalMarker.textContent = TOTAL
}

function createBlackOut(message=undefined){
        const optionBlackOut = document.createElement('div')
        optionBlackOut.className = 'option-blackout'
        optionBlackOut.id = 'option-blackout'
        optionsCtn.appendChild(optionBlackOut)
        if (message) questionErrorMessage.textContent = message
        else questionErrorMessage.textContent = ""
}

function removeBlackOut(){
    const divEliminar = document.querySelector('.option-blackout');
    divEliminar.remove();
}

function checkIfDonned(index){
    let indexNum = index + 1
    let finded = doneQuestions.find((object) => {
        return object.index == indexNum
    })
    if (finded) {
        if (finded.correct == finded.choosen) showQuestion(index, true, finded.choosen)
        else showQuestion(index, true, finded.choosen)
    } else showQuestion(index, false)
}

// Para darle el scroll con el mobile a las preguntas
let startX;
questionsCtn.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
});

questionsCtn.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const deltaX = startX - touchX;
    const parallaxOffset = deltaX * 0.3;
    const items = document.querySelectorAll('.scroll-item');
    items.forEach(item => {
            item.style.transform = `translateX(${-parallaxOffset}px)`;
    });
});

questionsCtn.addEventListener('touchend', (event) => {
    const items = document.querySelectorAll('.scroll-item');
    items.forEach(item => {
        item.style.transform = `translateX(0px)`;
    });
    const touchX = event.changedTouches[0].clientX;
    const deltaX = startX - touchX;
    startX = touchX;
    if (deltaX > 0 && deltaX > 100) nextQuestionHandler(event)
    else if (deltaX < 0 && deltaX < -100) previousQuestionHandler(event)
});

getBackButton.addEventListener('click', () => {
    if (examModal.classList.contains('flex-active')) {
        examModal.classList.remove('flex-active')
    }
})

questionImageButton.addEventListener('click', (e) => {
    imageModal.classList.add('flex-active')
})

closeImageModalButton.addEventListener('click', (e) => {
    imageModal.classList.remove('flex-active')
})

imageModal.addEventListener('click', (e) => {
    e.preventDefault()
    if (e.target !== questionImage) imageModal.classList.remove('flex-active')
})

document.addEventListener('keydown', (e) => {
    const allModals = document.querySelectorAll('.modal')
    let anyModalActive = false
    allModals.forEach(modal => { if (modal.classList.contains('flex-active')) anyModalActive = true })
    if (!examModal.classList.contains('flex-active') || anyModalActive) return;
    if (e.key == 'ArrowLeft') previousQuestionHandler(e)
    else if (e.key == 'ArrowRight') nextQuestionHandler(e)
})

nextButton.addEventListener('click', nextQuestionHandler)
previousButton.addEventListener('click', previousQuestionHandler)

remakeButton.addEventListener('click', () => {
    let indexNum = counter + 1
    let finded = doneQuestions.find((object) => {
        return object.index == indexNum
    })
    if (finded) {
        if (finded.correct == finded.choosen) {
            if (CORRECTAS > 0) CORRECTAS--
            correctMarker.textContent = CORRECTAS
        } else {
            if (ERRORES > 0) ERRORES--
            errorMarker.textContent = ERRORES
        }
        TOTAL--
        totalMarker.textContent = TOTAL
        removeBlackOut()
        document.getElementById(indexNum).className = 'circle-neutral-ctn'
        document.querySelectorAll('.option-error').forEach(elemento => elemento.classList.remove('option-error'));
        document.querySelectorAll('.option-correct').forEach(elemento => elemento.classList.remove('option-correct'));
    } 
    doneQuestions = doneQuestions.filter((e) => e.index != indexNum)
})

const reportQuestionButton = document.getElementById('report-question-button')
const reportedQuestionSpan = document.getElementById('reported-question-span')
const reportedQuestionInfo = document.getElementById('reported-question-info')
reportQuestionButton.addEventListener('click', (e) => {
    e.stopPropagation()
    let path = ""
    let pathRadios = document.querySelectorAll('.path-radio')
    if (pathRadios) {
        pathRadios.forEach(radio => path += `\n${dom_utils.clean_string_spaces(radio.value)}`)
    }
    let currentQ = PREGUNTAS[counter]
    reportedQuestionSpan.textContent = `[ Examen unico ${currentQ['origin']['exam']}, pregunta ${currentQ['index']}) ]`
    reportedQuestionInfo.value = `${currentQ['id']} \n EU ${currentQ['origin']['exam']}, ${currentQ['index']}).\n\nPaths:${path}`
})

// Option key binding 
document.addEventListener("keydown", (e) => {
    if (!examModal.classList.contains("flex-active") || document.getElementById("option-blackout") || document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") return;
    let optionSelected = document.getElementById(e.key)
    if (optionSelected)  optionSelected.click()
})

export default {
    displayExam
}