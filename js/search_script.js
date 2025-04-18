import schema_utils from "../utils/schema_utils.js";
import dom_utils from "../utils/dom_utils.js";
import exam_script from "./exam_script.js";

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

document.addEventListener('keydown', (e) => {
    if (e.key == '/') {
        if (!document.getElementById('exam-modal').classList.contains('flex-active') && document.activeElement.tagName != 'INPUT' && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault()
            searcher.focus()
        }
    }
})

document.addEventListener('DOMContentLoaded', function() {
    fetch('./data/schema.json')
        .then(response => response.json())
        .then(data => {
            displayPage(data);
        })
        .catch(error => {
            console.error('Error al obtener los datos JSON: \n', error);
        });
});

// COPIAR EMAIL

const EMAIL = 'euchoices@gmail.com'
let emailLinks = document.querySelectorAll('.copy-email-button')
function copyEmailHandler(e) {
    try {
        navigator.clipboard.writeText(EMAIL);
        alert("Copiaste el email: " + EMAIL);
    } catch (err) {
        alert(`Se intento copiar el email en el portapapeles pero hubo un error:\n${err}`)
    }
}

emailLinks.forEach(element => {
    element.addEventListener('click', copyEmailHandler)
    element.addEventListener('touchstart', copyEmailHandler)
});

function displayPage(data){
    function setAllQuestionCounter() {
        let years = dom_utils.validateYears(yearsInputs, yearsInputsCtn)
        if (years) {
            let allQuestions = []
            let paths = []
            let pathRadios = document.querySelectorAll('.path-radio')
            if (pathRadios) {
                pathRadios.forEach(radio => paths.push(dom_utils.clean_string_spaces(radio.value)))
                for (let path of paths) {
                    if (!schema_utils.confirmIfPathExists(path, SCHEMA)) return;
                }
                allQuestions = schema_utils.getQuestions(paths, SCHEMA, years)
                allQuestionsCounter.textContent = `${allQuestions.length} preguntas`
            } else allQuestionsCounter.textContent = '800 preguntas'
        }
    }

    const SCHEMA = data;

    yearsInputs.forEach(input => {
        input.checked = true
        input.addEventListener('change', (e) => {
            let allChecked = true;
            yearsInputs.forEach(input => {
                if (input.checked == false) {
                    allChecked = false
                    return;
                }
            })
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
        // Para que cada vez que hacemos focus out del searcher desaparezca la lista
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
        const allPathOptions = document.querySelectorAll('.path-option')
        allPathOptions.forEach(pathOption => {
            function submitOption(e) {
                const liElement = e.target.closest("li"); // busca el li más cercano hacia arriba
                if (liElement) {
                    liElement.classList.add("path-selected");
                }
                let saveValue = searcher.value
                searcher.value = pathOption.id
                submitSearchInput(e) // Creo que seria mejor intentar que se active el 'submit' event de searchForm
                setAllQuestionCounter()
                searcher.value = saveValue
            }
            // Agregar "path-selected" al li para mostrar que ya esta agregado
            if (dom_utils.checkIfPathAllreadyAdded(pathOption.id, pathsForm)) {
                pathOption.classList.add("path-selected")
            }
            pathOption.addEventListener('click', submitOption)
            pathOption.addEventListener('keydown', (e) => { 
                e.preventDefault()
                if (e.key == 'Enter') submitOption(e)
                else if (e.key == 'ArrowDown') {
                    if (e.target.nextSibling) e.target.nextSibling.focus()
                    else e.target.focus()
                } else if (e.key == 'ArrowUp') {
                    if (e.target.previousSibling) e.target.previousSibling.focus()
                    else searcher.focus()
                }
            })
        })
    }

    searcher.addEventListener("keydown", (e) => {
        if (e.key == 'ArrowDown') {
            dom_utils.keyDownSearcher()
            e.preventDefault()
        }
    })
    searcher.addEventListener('focusin', searchHandler)
    searcher.addEventListener('input', searchHandler)

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
                matchedPath.classList.remove("path-selected")
                targetDiv.remove()
            }
        }
        setAllQuestionCounter()
    }

    searchForm.addEventListener('submit', submitSearchInput)

    cleanAllPathsButton.addEventListener('click', (e) => {
        while (pathsForm.firstChild) pathsForm.removeChild(pathsForm.firstChild);
        setAllQuestionCounter()
    })

    submitAllButton.addEventListener('click', (e) => {
        let years = dom_utils.validateYears(yearsInputs, yearsInputsCtn)
        let allQuestions = []
        let paths = []
        let pathRadios = document.querySelectorAll('.path-radio')
        if (pathRadios) {
            pathRadios.forEach(radio => paths.push(dom_utils.clean_string_spaces(radio.value)))
            for (let path of paths) {
                if (!schema_utils.confirmIfPathExists(path, SCHEMA)) return;
            }
            allQuestions = schema_utils.getQuestions(paths, SCHEMA, years)
        } else allQuestions = schema_utils.getQuestions([], SCHEMA, years)

        if (allQuestions.length == 0) {
            let errorModal = document.getElementById('error-modal')
            errorModal.classList.add('flex-active')
            errorModal.querySelector('p').textContent = 'NO hay preguntas sobre esos temas'
            return;
        }

        if (shuffleButton.checked) allQuestions.sort(() => Math.random() - 0.5)

        exam_script.displayExam(allQuestions)
    })
    setAllQuestionCounter()
}
