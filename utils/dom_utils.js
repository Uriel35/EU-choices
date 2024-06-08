import schema_utils from "./schema_utils.js"
import utils from "./main_utils.js"

const pathOptionsCtn = document.getElementById('matched-search-list')

function clean_string_spaces(value){
    // console.log(value)
    value = value.replace(/^\s+/, '')
    value = value.replace(/\s+$/, '')
    value = value.replace(/\s+{2, }/, ' ')
    value = value.replace(/(\s+)?\/(\s+)?/, '/')
    value = value.toLowerCase()
    return value
}

function deleteBracketsAndParentesis(value) {
  const regex = /\[[^\]]*\]|\([^)]*\)/g;
  value = value.replace(regex, '')
  value = clean_string_spaces(value)
  return value
}

function addItemsToSearchList(result, value){
    while (pathOptionsCtn.firstChild) pathOptionsCtn.removeChild(pathOptionsCtn.firstChild);
    if (result.length == 0) {
        let p = document.createElement('p')
        p.textContent = 'NO se han encontrado especialidades ni temas'
        pathOptionsCtn.appendChild(p)
        return;
    }
    result.sort((a, b) => b.counter - a.counter) // Se ordenan segun cantidad de preguntas de cada Path.
    for (let path of result){
        let option = document.createElement('li')
        let pAnalogue = document.createElement('p')
        let pre = document.createTextNode('')
        let matchedSpan = document.createElement('span')
        let post = document.createTextNode('')
        matchedSpan.classList.add('highligth')
        if ('analogo' in path) {
            let splitted = value.split(/\//)
            if (splitted.length == 2) {
                let speciality_str = splitted[0].trim()
                let analoge_str = splitted[1].trim()

                let specialityPre = document.createTextNode('')
                let specialitySpan = document.createElement('span')
                specialitySpan.classList.add('highligth')
                let specialityPost = document.createTextNode('')
                specialityPre.textContent = `${path.speciality.substring(0, path.speciality.indexOf(speciality_str))}`
                specialitySpan.textContent = `${path.speciality.substring(path.speciality.indexOf(speciality_str), path.speciality.indexOf(speciality_str) + speciality_str.length)}`
                specialityPost.textContent = `${path.speciality.substring(path.speciality.indexOf(speciality_str) + speciality_str.length, path.speciality.length)}`
                let themeText = document.createTextNode(` / ${path.theme}`)

                option.appendChild(specialityPre)
                option.appendChild(specialitySpan)
                option.appendChild(specialityPost)
                option.appendChild(themeText)

                pre.textContent = `[${path.analogo.substring(0, path.analogo.indexOf(analoge_str))}`
                matchedSpan.textContent = `${path.analogo.substring(path.analogo.indexOf(analoge_str), path.analogo.indexOf(analoge_str) + analoge_str.length)}`
                post.textContent = `${path.analogo.substring(path.analogo.indexOf(analoge_str) + analoge_str.length, path.analogo.length)}] (${path.counter}) (tema)`
                pAnalogue.appendChild(pre)
                pAnalogue.appendChild(matchedSpan)
                pAnalogue.appendChild(post)
            } else {
                option.textContent = `${path.speciality} / ${path.theme}`;
                pre.textContent = `[${path.analogo.substring(0, path.analogo.indexOf(value))}`
                matchedSpan.textContent = path.analogo.substring(path.analogo.indexOf(value), path.analogo.indexOf(value) + value.length)
                post.textContent = `${path.analogo.substring(path.analogo.indexOf(value) + value.length, path.analogo.length)}] (${path.counter}) (tema)`
                pAnalogue.appendChild(pre)
                pAnalogue.appendChild(matchedSpan)
                pAnalogue.appendChild(post)
            }
        } else if ('theme' in path) {
            let splitted = value.split(/\//)
            if (splitted.length == 2) {
                let speciality_str = splitted[0].trim()
                let theme_str = splitted[1].trim()
                let specialityPre = document.createTextNode('')
                let specialitySpan = document.createElement('span')
                specialitySpan.classList.add('highligth')
                let specialityPost = document.createTextNode('')
                specialityPre.textContent = `${path.speciality.substring(0, path.speciality.indexOf(speciality_str))}`
                specialitySpan.textContent = `${path.speciality.substring(path.speciality.indexOf(speciality_str), path.speciality.indexOf(speciality_str) + speciality_str.length)}`
                specialityPost.textContent = `${path.speciality.substring(path.speciality.indexOf(speciality_str) + speciality_str.length, path.speciality.length)} / `
                let themePre = document.createTextNode('')
                let themeSpan = document.createElement('span')
                themeSpan.classList.add('highligth')
                let themePost = document.createTextNode('')
                themePre.textContent = `${path.theme.substring(0, path.theme.indexOf(theme_str))}`
                themeSpan.textContent = `${path.theme.substring(path.theme.indexOf(theme_str), path.theme.indexOf(theme_str) + theme_str.length)}`
                themePost.textContent = `${path.theme.substring(path.theme.indexOf(theme_str) + theme_str.length, path.theme.length)}`
                option.appendChild(specialityPre)
                option.appendChild(specialitySpan)
                option.appendChild(specialityPost)
                option.appendChild(themePre)
                option.appendChild(themeSpan)
                option.appendChild(themePost)

            } else {
                if (path.theme.indexOf(value) != -1) {
                    pre.textContent = `${path.speciality} / ${path.theme.substring(0, path.theme.indexOf(value))}`
                    matchedSpan.textContent = path.theme.substring(path.theme.indexOf(value), path.theme.indexOf(value) + value.length)
                    post.textContent = `${path.theme.substring(path.theme.indexOf(value) + value.length, path.theme.length)}`
                    option.appendChild(pre)
                    option.appendChild(matchedSpan)
                    option.appendChild(post)
                } else {
                    pre.textContent = `${path.speciality.substring(0, path.speciality.indexOf(value))}`
                    matchedSpan.textContent = path.speciality.substring(path.speciality.indexOf(value), path.speciality.indexOf(value) + value.length)
                    post.textContent = `${path.speciality.substring(path.speciality.indexOf(value) + value.length, path.speciality.length)} / ${path.theme}`
                    option.appendChild(pre)
                    option.appendChild(matchedSpan)
                    option.appendChild(post)
                }
            }
            pAnalogue.textContent = `(${path.counter}) (tema)`
        } else {
            pre.textContent = `${path.speciality.substring(0, path.speciality.indexOf(value))}`
            matchedSpan.textContent = path.speciality.substring(path.speciality.indexOf(value), path.speciality.indexOf(value) + value.length)
            post.textContent = `${path.speciality.substring(path.speciality.indexOf(value) + value.length, path.speciality.length)}`
            option.appendChild(pre)
            option.appendChild(matchedSpan)
            option.appendChild(post)
            pAnalogue.textContent = `(${path.counter}) (especialidad)`
        }
        option.id = option.textContent
        option.classList.add('path-option')
        option.setAttribute('tabindex', 0)
        option.appendChild(pAnalogue)
        pathOptionsCtn.appendChild(option)
    }
}

function invalidateInput(input, message=undefined){
    input.blur()
    input.classList.add('error-input')
    if (message) {
        input.nextElementSibling.textContent = message
    }
}

function validateYears(yearsInputs, yearsInputsCtn){
    let yearsInputsValues = []
    yearsInputs.forEach(yearInput => {
        if (yearInput.checked) yearsInputsValues.push(yearInput.value);
    })
    if (yearsInputsValues.length == 0) {
        yearsInputs.forEach(yearInput => yearsInputsValues.push(yearInput.value))
        if (yearsInputsCtn.classList.contains('error-input')) yearsInputsCtn.classList.remove('error-input')
    } else {
        if (yearsInputsCtn.classList.contains('error-input')) yearsInputsCtn.classList.remove('error-input')
    }
    return yearsInputsValues
}

function checkIfPathAllreadyAdded(value, formCtn) {
    let labels = formCtn.getElementsByTagName('label')
    for (let label of labels){
        if (label.textContent.toLowerCase() == value.toLowerCase()){
            return true
        }
    }
    return false
}

function addPath(value, formCtn, resetQuestionCounterFx) {
    let ctn = document.createElement('div')
    ctn.className = 'path-ctn'
    let radio = document.createElement('input')
    let trash = document.createElement('i')
    trash.className = 'fas fa-trash'
    trash.tabIndex = 0
    radio.type = 'radio'
    radio.id = value
    radio.name = 'path-radio-inputs'
    radio.className = 'path-radio'
    radio.value = value
    let label = document.createElement('label')
    label.textContent = value
    label.htmlFor = value
    ctn.appendChild(radio)
    ctn.appendChild(label)
    ctn.appendChild(trash)
    formCtn.appendChild(ctn)
    trash.addEventListener('click', (e) => {
        ctn.remove()
        resetQuestionCounterFx()
    })
    trash.addEventListener('keydown', (e) => {
        if (e.key == "Enter") {
            console.log("Es enter")
            ctn.remove()
            resetQuestionCounterFx()
        }
        console.log("NO es Enter")
    })
}

function keyDownSearcher(){
    if (pathOptionsCtn.firstChild) pathOptionsCtn.firstChild.focus()
}


function elementCreate(type, content="", classes=[], element_id="", childs=[], appendToCtn=false) {
    let element = document.createElement(type)
    if (content != "") element.textContent = content
    if (classes != []) {
        for (let clase of classes) element.classList.add(clase)
    } 
    if (element_id != "") element.id = element_id

    if (childs != []) {
        for (let child of childs) element.appendChild(child)
    } 
    if (appendToCtn != false) appendToCtn.appendChild(element)

    return element
}


function discussionsHandler(discussionList, discussionsCtn) {
    discussionList.forEach((disc, i) => {
        let explication = document.createElement("p")
        let explicationEdited = disc["explication"].replace(/\n/g, "<br>")
        explication.classList.add("explication")
        explication.innerHTML = explicationEdited

        // let explication = elementCreate("p", disc["explication"], "explication", "", [], false)

        let bibliographyCtn = document.createElement("div")
        if (disc["bibliography"] != "") {
            bibliographyCtn.classList.add("discussion-bibliography-ctn")
            let bibliographyTitle = elementCreate("p", "Bibliografia", [], "", [], bibliographyCtn)
            bibliographyCtn.appendChild(bibliographyTitle)
            let bibliographyUl = elementCreate("ul", "", ["bibliography-ul"], "", [], bibliographyCtn)

            let bibliographyItems = disc["bibliography"].split("\n") 
            for (let biblioItem of bibliographyItems) {
                if (biblioItem == "") {
                    continue;
                } else {
                    elementCreate("li", biblioItem, [], "", [], bibliographyUl)
                }
            }
        }

        let authorDateCtn = document.createElement("div")
        authorDateCtn.classList.add("discussion-about-ctn")
        let author = elementCreate("p", "", ["author"], "", [], authorDateCtn)
        if (disc["name"] == "") author.textContent = "Anonimo"
        else author.textContent = disc["name"]

        let aboutDate = elementCreate("p", "", ["discussion-date"], "", [], authorDateCtn)
        let fecha = new Date(disc["date"])
        aboutDate.textContent = utils.formateDateFx(fecha)


        let discussionItemCtn = elementCreate("div", "", ["discussion"], "", [explication, bibliographyCtn, authorDateCtn], discussionsCtn)

        if (i % 2 == 0) discussionItemCtn.classList.add("discussion-ligth")
        else discussionItemCtn.classList.add("discussion-dark")
    })
}


export default {
    addItemsToSearchList,
    invalidateInput,
    addPath,
    validateYears,
    checkIfPathAllreadyAdded,
    clean_string_spaces,
    keyDownSearcher,
    elementCreate,
    discussionsHandler
}