import schema_utils from "../utils/schema_utils.js";
import dom_utils from "../utils/dom_utils.js";
import modal_script from "./modal_script.js";

const ANSWER_KEYS = ["a", "b", "c", "d"]
const VALID_ANSWERS = new Set([...ANSWER_KEYS, "invalid"])

const examModal = document.getElementById('exam-modal')
const questionsCtn = document.querySelector('.questions-ctn')
const questionCtn = document.getElementById('question-ctn')
const optionsCtn = document.getElementById('options-ctn')
const circlesCtn = document.getElementById('circles-ctn')
const circlesModal = document.getElementById('circle-modal')
const circlesModalCtn = document.getElementById('circles-modal-ctn')
const questionImageButtonCtn = document.getElementById('img-button-ctn')
const questionImageButton = document.getElementById('display-img-modal-button')
const imageModal = document.getElementById('img-modal')
const questionImage = document.getElementById('question-img')
const closeImageModalButton = document.getElementById('img-modal-close-button')
const questionOriginText = document.getElementById('origin-text')
const questionErrorMessage = document.getElementById('question-error-message')
const discussionsCtn = document.getElementById("discussions-ctn")
const discussions = document.getElementById("discussions")
const emptyDiscussion = document.getElementById("empty-discussion-ctn")
const addDiscussionButton = document.getElementById("add-discussion-btn")
const discussionFormLink = document.getElementById("discussion-form-link")
const pdfButton = document.getElementById("pdf-button")
const nextButton = document.getElementById('next-btn')
const previousButton = document.getElementById('previous-btn')
const remakeButton = document.getElementById('remake-q-btn')
const getBackButton = document.getElementById('get-back-button')
const correctMarker = document.getElementById('correct-marker')
const errorMarker = document.getElementById('error-marker')
const totalMarker = document.getElementById('total-marker')
const percentageMarker = document.getElementById("percentage-marker")
const toggleTimerBtn = document.getElementById("toggle-timer-btn")
const reportQuestionButton = document.getElementById('report-question-button')
const reportedQuestionSpan = document.getElementById('reported-question-span')
const reportedQuestionInfo = document.getElementById('reported-question-info')
const reportedQuestionSubject = document.getElementById('reported-question-subject')
const pathsListModalButton = document.getElementById("paths-list-modal-button")
const pathsListModal = document.getElementById("paths-list-modal")
const pathsListModalCtn = document.getElementById("paths-list-modal-ctn")
const pathsListModalUl = document.getElementById("paths-list-result-modal")
const pathsListModalQuestion = document.getElementById("paths-list-modal-question")
const reportQuestionInPathsListButton = document.getElementById("report-question-in-paths-list-button")
const closePathsListModalButton = document.getElementById("close-paths-list-modal")
const timerHours = document.getElementById('hours')
const timerMinutes = document.getElementById('minutes')
const timerSeconds = document.getElementById('seconds')

const state = {
    total: 0,
    correct: 0,
    errors: 0,
    questions: [],
    answeredQuestions: new Map(),
    counter: 0
}

let timer
let isRunning = false
let hours = 0
let minutes = 0
let seconds = 0
let touchStartX = 0

function displayExam(allQuestions) {
    state.questions = allQuestions.map((question, index) => ({
        ...question,
        "custom-index": index + 1
    }))
    state.answeredQuestions = new Map()
    state.counter = 0
    state.total = 0
    state.correct = 0
    state.errors = 0

    renderCircles()
    resetMarkers()
    resetTimer()
    startTimer()

    examModal.classList.add('flex-active')
    showQuestionAt(0)
}

function renderCircles() {
    circlesCtn.textContent = ''
    circlesModalCtn.textContent = ''

    const circlesFragment = document.createDocumentFragment()
    const modalCirclesFragment = document.createDocumentFragment()

    for (let i = 1; i <= state.questions.length; i++) {
        circlesFragment.appendChild(createCircleElement(i))
        modalCirclesFragment.appendChild(createCircleElement(i, true))
    }

    circlesCtn.appendChild(circlesFragment)
    circlesModalCtn.appendChild(modalCirclesFragment)
}

function createCircleElement(index, modalCircle = false) {
    const circle = document.createElement('div')
    circle.className = 'circle-neutral-ctn'
    circle.textContent = index
    circle.dataset.index = String(index - 1)
    if (modalCircle) {
        circle.id = `modal-${index}`
    } else {
        circle.id = String(index)
    }
    return circle
}

function showQuestionAt(index) {
    state.counter = index
    const answeredRecord = state.answeredQuestions.get(getCurrentQuestionNumber())

    renderCurrentQuestion()

    if (answeredRecord) {
        lockQuestion()
        applyAnswerStyles(answeredRecord.correct, answeredRecord.choosen)
        return
    }

    const answer = getCurrentQuestion().answer.toLowerCase()
    if (answer === 'invalid') {
        lockQuestion('Pregunta oficialmente invalidada')
    } else if (!VALID_ANSWERS.has(answer)) {
        lockQuestion('Pregunta incompleta')
    }
}

function renderCurrentQuestion() {
    if (state.total !== state.questions.length) {
        startTimer()
    }

    removeBlackOut()
    clearRenderedDiscussions()

    const question = getCurrentQuestion()
    const currentQuestionNumber = getCurrentQuestionNumber()
    const reportLink = buildDiscussionFormLink(question)

    addDiscussionButton.href = reportLink
    discussionFormLink.href = reportLink
    pdfButton.href = `./data/choices/examen_unico_${question.origin.exam}.pdf`

    questionCtn.textContent = `${question['custom-index']}) ${question.question}`
    questionOriginText.textContent = `Examen unico ${question.origin.exam}, pregunta ${question.index}), tema 'A'`

    renderQuestionImage(question)
    renderDiscussions(question.discussion)
    renderOptions(question)
    syncActiveCircle(currentQuestionNumber)
}

function buildDiscussionFormLink(question) {
    return `https://docs.google.com/forms/d/e/1FAIpQLSckutbAadPXsxUmPeWHaI3J7dBYnqgxb-QGtzVDyee4TnJPLQ/viewform?usp=pp_url&entry.1641804022=${question.origin.exam}&entry.432963879=${question.index}`
}

function renderQuestionImage(question) {
    if (question.image === '') {
        questionImageButtonCtn.classList.remove('flex-active')
        questionImage.removeAttribute('src')
        return
    }

    questionImageButtonCtn.classList.add('flex-active')
    questionImage.setAttribute('src', `img/${question.image}.png`)
}

function renderDiscussions(discussionList) {
    if (discussionList.length === 0) {
        emptyDiscussion.classList.add("flex-active")
        return
    }

    emptyDiscussion.classList.remove("flex-active")
    dom_utils.discussionsHandler(discussionList, discussions)
}

function clearRenderedDiscussions() {
    discussionsCtn.classList.remove("flex-active")
    discussions.querySelectorAll(".discussion").forEach(element => element.remove())
}

function renderOptions(question) {
    optionsCtn.textContent = ''
    questionErrorMessage.textContent = ''

    const fragment = document.createDocumentFragment()

    for (let letter of ANSWER_KEYS) {
        let option = document.createElement('div')
        option.className = 'option'
        option.id = letter
        option.textContent = `${letter}) ${question.options[letter]}`
        fragment.appendChild(option)
    }

    optionsCtn.appendChild(fragment)
}

function syncActiveCircle(questionNumber) {
    document.querySelector('.circle-actual')?.classList.remove('circle-actual')

    const activeCircle = document.getElementById(String(questionNumber))
    activeCircle?.classList.add('circle-actual')

    if (!activeCircle) return

    const contentWidth = circlesCtn.scrollWidth
    const containerWidth = circlesCtn.clientWidth

    if (contentWidth > containerWidth) {
        circlesCtn.scrollLeft = activeCircle.offsetLeft - containerWidth / 2
    }
}

function lockQuestion(message = '') {
    createBlackOut(message)
}

function createBlackOut(message = '') {
    if (!document.getElementById('option-blackout')) {
        const optionBlackOut = document.createElement('div')
        optionBlackOut.className = 'option-blackout'
        optionBlackOut.id = 'option-blackout'
        optionsCtn.appendChild(optionBlackOut)
    }

    questionErrorMessage.textContent = message
    discussionsCtn.classList.add("flex-active")
}

function removeBlackOut() {
    document.getElementById('option-blackout')?.remove()
    discussionsCtn.classList.remove("flex-active")
}

function applyAnswerStyles(correctAnswer, chosenAnswer) {
    document.getElementById(correctAnswer)?.classList.add('option-correct')

    if (chosenAnswer !== correctAnswer) {
        document.getElementById(chosenAnswer)?.classList.add('option-error')
    }

    const questionNumber = getCurrentQuestionNumber()
    const isCorrect = correctAnswer === chosenAnswer
    setCircleStatus(questionNumber, isCorrect ? 'circle-correct' : 'circle-error')
}

function setCircleStatus(questionNumber, statusClass = 'circle-neutral-ctn') {
    const circle = document.getElementById(String(questionNumber))
    const modalCircle = document.getElementById(`modal-${questionNumber}`)

    const statusClasses = ['circle-neutral-ctn', 'circle-correct', 'circle-error']

    function applyStatus(element) {
        if (!element) return
        element.classList.remove(...statusClasses)
        element.classList.add('circle-neutral-ctn')
        if (statusClass !== 'circle-neutral-ctn') {
            element.classList.add(statusClass)
        }
    }

    applyStatus(circle)
    applyStatus(modalCircle)
}

function submitAnswer(answerId) {
    const questionNumber = getCurrentQuestionNumber()
    const question = getCurrentQuestion()
    const correctAnswer = question.answer.toLowerCase()

    if (state.answeredQuestions.has(questionNumber) || document.getElementById('option-blackout')) {
        return
    }

    state.answeredQuestions.set(questionNumber, {
        index: questionNumber,
        choosen: answerId,
        correct: correctAnswer
    })

    const isCorrect = correctAnswer === answerId
    updateMarkersAfterAnswer(isCorrect)
    applyAnswerStyles(correctAnswer, answerId)
    lockQuestion()

    if (state.total === state.questions.length) {
        stopTimer()
    }
}

function updateMarkersAfterAnswer(isCorrect) {
    if (isCorrect) {
        state.correct++
    } else {
        state.errors++
    }
    state.total++
    renderMarkers()
}

function undoCurrentAnswer() {
    const questionNumber = getCurrentQuestionNumber()
    const answeredRecord = state.answeredQuestions.get(questionNumber)

    if (!answeredRecord) return

    if (answeredRecord.correct === answeredRecord.choosen) {
        state.correct = Math.max(0, state.correct - 1)
    } else {
        state.errors = Math.max(0, state.errors - 1)
    }

    state.total = Math.max(0, state.total - 1)
    state.answeredQuestions.delete(questionNumber)

    removeBlackOut()
    setCircleStatus(questionNumber)
    optionsCtn.querySelectorAll('.option-error').forEach(element => element.classList.remove('option-error'))
    optionsCtn.querySelectorAll('.option-correct').forEach(element => element.classList.remove('option-correct'))

    renderMarkers()

    if (!isRunning && state.total !== state.questions.length) {
        startTimer()
    }
}

function resetMarkers() {
    renderMarkers()
}

function renderMarkers() {
    const percentage = state.total === 0 ? 0 : (state.correct / state.total) * 100
    correctMarker.textContent = state.correct
    errorMarker.textContent = state.errors
    totalMarker.textContent = state.total
    percentageMarker.textContent = `${percentage.toFixed(1)}%`
}

function goToAdjacentQuestion(direction) {
    const questionsLength = state.questions.length
    if (questionsLength === 0) return

    state.counter = (state.counter + direction + questionsLength) % questionsLength
    showQuestionAt(state.counter)
}

function getCurrentQuestion() {
    return state.questions[state.counter]
}

function getCurrentQuestionNumber() {
    return state.counter + 1
}

function updateDisplay() {
    timerHours.textContent = String(hours).padStart(2, '0')
    timerMinutes.textContent = String(minutes).padStart(2, '0')
    timerSeconds.textContent = String(seconds).padStart(2, '0')
}

function startTimer() {
    if (isRunning) return

    isRunning = true
    timer = setInterval(() => {
        seconds++
        if (seconds >= 60) {
            seconds = 0
            minutes++
            if (minutes >= 60) {
                minutes = 0
                hours++
            }
        }
        updateDisplay()
    }, 1000)

    toggleTimerBtn.classList.replace("fa-play", "fa-pause")
}

function resetTimer() {
    hours = 0
    minutes = 0
    seconds = 0
    updateDisplay()
    toggleTimerBtn.classList.replace("fa-play", "fa-pause")
}

function stopTimer() {
    if (!isRunning) return
    clearInterval(timer)
    isRunning = false
    toggleTimerBtn.classList.replace("fa-pause", "fa-play")
}

function closeExam() {
    if (!examModal.classList.contains('flex-active')) return
    examModal.classList.remove('flex-active')
    stopTimer()
}

function renderReportQuestionData() {
    const currentQuestion = getCurrentQuestion()
    reportedQuestionSpan.textContent = `[ Examen unico ${currentQuestion.origin.exam}, pregunta ${currentQuestion.index}) ]`
    reportedQuestionInfo.value = `Examen unico ${currentQuestion.origin.exam}, pregunta ${currentQuestion.index}).`
    reportedQuestionSubject.value = `Pregunta reportada, Año ${currentQuestion.origin.exam}, pregunta ${currentQuestion.index}).`
}

function renderQuestionPathsModal() {
    const currentQuestion = getCurrentQuestion()
    const paths = schema_utils.getPaths(currentQuestion)

    pathsListModalQuestion.textContent = `[ Examen unico ${currentQuestion.origin.exam}, pregunta ${currentQuestion.index}) ]`
    pathsListModalUl.textContent = ''

    paths.forEach((path, index) => {
        let li = document.createElement("li")
        if (index % 2 === 0) li.className = "path-dark"
        li.textContent = `${path.speciality} / ${path.theme}`
        pathsListModalUl.appendChild(li)
    })
}

circlesCtn.addEventListener('click', (e) => {
    const circle = e.target.closest('[data-index]')
    if (!circle) return
    showQuestionAt(Number(circle.dataset.index))
})

circlesModalCtn.addEventListener('click', (e) => {
    const circle = e.target.closest('[data-index]')
    if (!circle) return
    showQuestionAt(Number(circle.dataset.index))
    modal_script.closeModal(circlesModal)
})

optionsCtn.addEventListener('click', (e) => {
    const option = e.target.closest('.option')
    if (!option) return
    submitAnswer(option.id)
})

questionsCtn.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX
})

questionsCtn.addEventListener('touchmove', (event) => {
    const deltaX = touchStartX - event.touches[0].clientX
    const parallaxOffset = deltaX * 0.3
    document.querySelectorAll('.scroll-item').forEach(item => {
        item.style.transform = `translateX(${-parallaxOffset}px)`
    })
})

questionsCtn.addEventListener('touchend', (event) => {
    document.querySelectorAll('.scroll-item').forEach(item => {
        item.style.transform = `translateX(0px)`
    })

    const touchX = event.changedTouches[0].clientX
    const deltaX = touchStartX - touchX
    touchStartX = touchX

    if (deltaX > 100) goToAdjacentQuestion(1)
    else if (deltaX < -100) goToAdjacentQuestion(-1)
})

modal_script.defineModal(questionImageButton, imageModal, questionImage, closeImageModalButton)
modal_script.defineModal(pathsListModalButton, pathsListModal, pathsListModalCtn, closePathsListModalButton)

nextButton.addEventListener('click', (e) => {
    e.stopPropagation()
    goToAdjacentQuestion(1)
})

previousButton.addEventListener('click', (e) => {
    e.stopPropagation()
    goToAdjacentQuestion(-1)
})

remakeButton.addEventListener('click', undoCurrentAnswer)
getBackButton.addEventListener('click', closeExam)
reportQuestionButton.addEventListener('click', (e) => {
    e.stopPropagation()
    renderReportQuestionData()
})

reportQuestionInPathsListButton.addEventListener("click", () => {
    const eventClick = new Event("click")
    closePathsListModalButton.dispatchEvent(eventClick)
    reportQuestionButton.dispatchEvent(eventClick)
})

pathsListModalButton.addEventListener("click", (e) => {
    e.stopPropagation()
    renderQuestionPathsModal()
})

toggleTimerBtn.addEventListener("click", () => {
    if (isRunning) {
        stopTimer()
        return
    }

    if (state.total !== state.questions.length) {
        startTimer()
    }
})

document.addEventListener('keydown', (e) => {
    const activeElementTag = document.activeElement?.tagName
    const anyModalActive = Array.from(document.querySelectorAll('.modal'))
        .some(modal => modal.classList.contains('flex-active'))

    if (!examModal.classList.contains('flex-active') || anyModalActive) return

    if (e.key === 'ArrowLeft') {
        goToAdjacentQuestion(-1)
    } else if (e.key === 'ArrowRight') {
        goToAdjacentQuestion(1)
    } else if (ANSWER_KEYS.includes(e.key) && activeElementTag !== "INPUT" && activeElementTag !== "TEXTAREA" && !document.getElementById("option-blackout")) {
        submitAnswer(e.key)
    }
})

imageModal.addEventListener("wheel", function(event) {
    event.preventDefault()

    let currentWidth = parseFloat(getComputedStyle(questionImage).width)
    const widthDelta = event.deltaY > 0 ? -20 : 20
    const nextWidth = Math.max(100, Math.min(currentWidth + widthDelta, 5000))
    questionImage.style.width = `${nextWidth}px`
})

export default {
    displayExam
}
