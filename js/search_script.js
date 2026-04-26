import schema_utils from "../utils/schema_utils.js";
import dom_utils from "../utils/dom_utils.js";
import exam_script from "./exam_script.js";
import modal_script from "./modal_script.js";

const searcher = document.getElementById('search-input')
const matchedSearchList = document.getElementById('matched-search-list')
const yearsInputs = document.querySelectorAll('.year-input')
const selectAllYearsInputs = document.getElementById('select-all-years-input')
const yearsInputsCtn = document.getElementById('year-input-ctn')
const searchForm = document.getElementById('formulario')
const pathsForm = document.getElementById('paths-form')
const submitAllButton = document.getElementById('submit-form')
const cleanAllPathsButton = document.getElementById('clean-all-paths-button')
const shuffleButton = document.getElementById('random-input')
const allQuestionsCounter = document.getElementById('all-q-counter')
const yearsControlsHome = document.getElementById('years-controls-home')
const yearsModalContent = document.getElementById('years-modal-content')
const searchControlsHome = document.getElementById('search-controls-home')
const searchModalContent = document.getElementById('search-modal-content')
const mobileLayoutQuery = window.matchMedia('(max-width: 767px)')
const yearsContainer = document.querySelector('.years-ctn')
const openYearsModalButton = document.getElementById('open-years-modal-button')
const yearsModal = document.getElementById('years-modal')
const yearsModalCtn = document.getElementById('years-modal-ctn')
const closeYearsModalButton = document.getElementById('close-years-modal')
const openSearchModalButton = document.getElementById('open-search-modal-button')
const searchModal = document.getElementById('search-modal')
const searchModalCtn = document.getElementById('search-modal-ctn')
const closeSearchModalButton = document.getElementById('close-search-modal')

document.addEventListener('keydown', (e) => {
    if (e.key == '/') {
        if (!document.getElementById('exam-modal').classList.contains('flex-active') && document.activeElement.tagName != 'INPUT' && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault()
            searcher.focus()
        }
    }
})

document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
    fetch('./data/schema.json').then(response => response.json()),
    fetch('./data/all_questions.json').then(response => response.json())
        ])
        .then(([schemaData, allQuestionsData]) => {
            displayPage(schemaData, allQuestionsData);
        })
        .catch(error => {
            console.error('Error al obtener los datos JSON:\n', error);
    });
});

const EMAIL = 'euchoices@gmail.com'
const emailLinks = document.querySelectorAll('.copy-email-button')
function copyEmailHandler(e) {
    e.preventDefault()
    try {
        navigator.clipboard.writeText(EMAIL);
        alert("Copiaste el email: " + EMAIL);
    } catch (err) {
        alert(`Se intento copiar el email en el portapapeles pero hubo un error:\n${err}`)
    }
}

emailLinks.forEach(element => {
    element.addEventListener('click', copyEmailHandler)
});

function displayPage(data, allQuestionsData){

    const SCHEMA = data;
    const ALLQUESTIONS = allQuestionsData
    schema_utils.initializeData(SCHEMA, ALLQUESTIONS)
    modal_script.defineModal(openYearsModalButton, yearsModal, yearsModalCtn, closeYearsModalButton)
    modal_script.defineModal(openSearchModalButton, searchModal, searchModalCtn, closeSearchModalButton)

    openSearchModalButton.addEventListener('click', () => {
        setTimeout(() => searcher.focus(), 50)
    })

    function syncResponsiveLayout() {
        if (mobileLayoutQuery.matches) {
            if (yearsControlsHome.parentElement !== yearsModalContent) {
                yearsModalContent.appendChild(yearsControlsHome)
            }
            if (searchControlsHome.parentElement !== searchModalContent) {
                searchModalContent.appendChild(searchControlsHome)
            }
        } else {
            if (yearsControlsHome.parentElement !== yearsContainer) {
                yearsContainer.appendChild(yearsControlsHome)
            }
            if (searchControlsHome.parentElement !== searchForm) {
                searchForm.appendChild(searchControlsHome)
            }
        }
    }

    function getSelectedPaths() {
        return Array.from(document.querySelectorAll('.path-radio')).map(radio =>
            dom_utils.clean_string_spaces(radio.value)
        )
    }

    function getFilteredQuestions() {
        let years = dom_utils.validateYears(yearsInputs, yearsInputsCtn)
        let paths = getSelectedPaths()

        for (let path of paths) {
            if (!schema_utils.confirmIfPathExists(path, SCHEMA)) return []
        }

        return schema_utils.getQuestions(paths, ALLQUESTIONS, years)
    }

    function setAllQuestionCounter() {
        let years = dom_utils.validateYears(yearsInputs, yearsInputsCtn)
        let paths = getSelectedPaths()
        let count = schema_utils.countQuestions(paths, years)
        allQuestionsCounter.textContent = `${count} preguntas`
    }

    function markAlreadySelectedPaths() {
        const allPathOptions = matchedSearchList.querySelectorAll('.path-option')
        allPathOptions.forEach(pathOption => {
            pathOption.classList.toggle(
                "path-selected",
                dom_utils.checkIfPathAllreadyAdded(pathOption.id, pathsForm)
            )
        })
    }

    function submitPathFromOption(pathId, listItem) {
        if (listItem) {
            listItem.classList.add("path-selected")
        }

        let saveValue = searcher.value
        searcher.value = pathId
        submitSearchInput(new Event('submit'))
        searcher.value = saveValue
    }

    yearsInputs.forEach(input => {
        input.checked = true
        input.addEventListener('change', (e) => {
            let allChecked = Array.from(yearsInputs).every(input => input.checked)
            if (allChecked) selectAllYearsInputs.checked = true
            else selectAllYearsInputs.checked = false
            setAllQuestionCounter()
        })
    })
    selectAllYearsInputs.addEventListener('change', (e) => {
        if (selectAllYearsInputs.checked) {
            yearsInputs.forEach(input => input.checked = true)
        } else yearsInputs.forEach(input => input.checked = false)
        setAllQuestionCounter()
    })

    document.addEventListener('click', (event) => {
        if (!matchedSearchList.contains(event.target) && event.target !== searcher) {
            matchedSearchList.classList.remove('flex-active')
        }
    });

    function searchHandler(e) {
        matchedSearchList.classList.add('flex-active')
        if (e.target.classList.contains('error-input')) e.target.classList.remove('error-input')

        let years = dom_utils.validateYears(yearsInputs, yearsInputsCtn)
        let result = schema_utils.searchInputHandler(e.target.value, SCHEMA, years);
        dom_utils.addItemsToSearchList(result, e.target.value)
        markAlreadySelectedPaths()
    }

    searcher.addEventListener("keydown", (e) => {
        if (e.key == 'ArrowDown') {
            dom_utils.keyDownSearcher()
            e.preventDefault()
        }
    })
    searcher.addEventListener('focusin', searchHandler)
    searcher.addEventListener('input', searchHandler)

    matchedSearchList.addEventListener('click', (e) => {
        const pathOption = e.target.closest('.path-option')
        if (!pathOption) return
        submitPathFromOption(pathOption.id, pathOption)
    })

    matchedSearchList.addEventListener('keydown', (e) => {
        const pathOption = e.target.closest('.path-option')
        if (!pathOption) return

        if (e.key == 'Enter') {
            e.preventDefault()
            submitPathFromOption(pathOption.id, pathOption)
        }
        else if (e.key == 'ArrowDown') {
            e.preventDefault()
            if (pathOption.nextSibling) pathOption.nextSibling.focus()
            else pathOption.focus()
        } else if (e.key == 'ArrowUp') {
            e.preventDefault()
            if (pathOption.previousSibling) pathOption.previousSibling.focus()
            else searcher.focus()
        }
    })

    function submitSearchInput(e) {
        e.preventDefault()
        let pathExists = schema_utils.confirmIfPathExists(searcher.value, SCHEMA)
        if (!pathExists) {
            dom_utils.invalidateInput(searcher, 'Especialidad y/o tema NO existente')
            return;
        } else {
            let allreadyAdded = dom_utils.checkIfPathAllreadyAdded(pathExists, pathsForm)
            if (!allreadyAdded) {
                dom_utils.addPath(pathExists, pathsForm, setAllQuestionCounter)
                searcher.classList.remove('error-input')
            } else {
                let allPathsSelected = document.querySelectorAll(".path-selected")
                let matchedPath = Array.from(allPathsSelected).find(el => el.id === pathExists);
                let targetDiv = pathsForm.querySelector(`input#${CSS.escape(pathExists)}`)?.closest('div');
                if (matchedPath) matchedPath.classList.remove("path-selected")
                if (targetDiv) targetDiv.remove()
            }
        }
        setAllQuestionCounter()
        markAlreadySelectedPaths()
    }

    searchForm.addEventListener('submit', submitSearchInput)

    cleanAllPathsButton.addEventListener('click', (e) => {
        while (pathsForm.firstChild) pathsForm.removeChild(pathsForm.firstChild);
        setAllQuestionCounter()
        markAlreadySelectedPaths()
    })

    submitAllButton.addEventListener('click', (e) => {
        e.preventDefault()
        let allQuestions = getFilteredQuestions()

        if (allQuestions.length == 0) {
            let errorModal = document.getElementById('error-modal')
            errorModal.classList.add('flex-active')
            document.body.classList.add("modal-open")
            errorModal.querySelector('p').textContent = 'NO hay preguntas sobre esos temas'
            return;
        }

        if (shuffleButton.checked) allQuestions.sort(() => Math.random() - 0.5)

        exam_script.displayExam(allQuestions)
    })
    mobileLayoutQuery.addEventListener('change', syncResponsiveLayout)
    syncResponsiveLayout()
    setAllQuestionCounter()
}
