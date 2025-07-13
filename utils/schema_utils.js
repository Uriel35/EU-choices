function clean_string_spaces(value){
    value = value.replace(/^\s+/, '')
    value = value.replace(/\s+$/, '')
    value = value.replace(/\s+{2, }/, ' ')
    value = value.replace(/(\s+)?\/(\s+)?/, '/')
    value = value.toLowerCase()
    return value
}

function searchInputHandler(value, schema, ALLQUESTIONS, years){
    let result = []
    if (value == undefined || value == '') {
        for (let speciality of Object.keys(schema)) {
            let spCounter = getQuestionCounter(speciality, false, schema, years, ALLQUESTIONS)
            result = result.concat({'speciality': speciality, 'counter': spCounter})
            for (let theme of Object.keys(schema[speciality])) {
                let qCounter = getQuestionCounter(speciality, theme, schema, years, ALLQUESTIONS)
                result = result.concat({'speciality': speciality, 'theme': theme, 'counter': qCounter})
            }
        }
        return result
    }

    value = clean_string_spaces(value)
    let splitted = value.split(/\//)
    if (splitted.length > 2) return result
    if (splitted.length == 1 || value[value.length - 1] == '/'){
        let word = splitted[0]
        let matchedSpecialities = findSpeciality(word, schema, years, ALLQUESTIONS)
        result = result.concat(matchedSpecialities)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])
        for (let speciality of justSpecialitiesMatched) {
            for (let theme of Object.keys(schema[speciality])) {
                let qCounter = getQuestionCounter(speciality, theme, schema, years, ALLQUESTIONS)
                result = result.concat({'speciality': speciality, 'theme': theme, 'counter': qCounter})
            }
        }
        for (let speciality of Object.keys(schema)){
            let matchedThemes = findTheme(word, speciality, schema, years, ALLQUESTIONS)
            result = result.concat(matchedThemes)
        }
    }
    else if (splitted.length == 2){
        let [speciality_str, theme_str] = splitted
        let matchedSpecialities = findSpeciality(speciality_str, schema, years, ALLQUESTIONS)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])
        for (let speciality of justSpecialitiesMatched){
            let matchedThemes = findTheme(theme_str, speciality, schema, years, ALLQUESTIONS)
            result = result.concat(matchedThemes)
        }
    }
    return result
}

function findSpeciality(value, schema, years, ALLQUESTIONS) {
    let result = []
    for (let speciality of Object.keys(schema)) {
        if (speciality.includes(value)){
            let qCounter = getQuestionCounter(speciality, false, schema, years, ALLQUESTIONS)
            console.log(qCounter)
            result.push({'speciality': speciality, 'counter': qCounter})
        }
    }
    return result
}

function findTheme(value, speciality, schema, years, ALLQUESTIONS){
    let result = []
    for (let theme of Object.keys(schema[speciality])) {
        if (theme.includes(value)) {
            let qCounter = getQuestionCounter(speciality, theme, schema, years, ALLQUESTIONS)
            result.push({'speciality': speciality, 'theme': theme, 'counter': qCounter})
        }
        else if(schema[speciality][theme].hasOwnProperty('analogos')){
            for (let analogo of schema[speciality][theme]["analogos"]){
                if (analogo.includes(value)) {
                    let qCounter = getQuestionCounter(speciality, theme, schema, years, ALLQUESTIONS)
                    result.push({'speciality': speciality, 'theme': theme, 'analogo': analogo, 'counter': qCounter});
                    break;
                }
            }
        } 
    }
    return result
}

function getQuestionCounter(speciality, theme, schema, years, ALLQUESTIONS) {
    let result = []
    if (!theme) {
        for (theme of Object.keys(schema[speciality])){
            let filtered = schema[speciality][theme]['array'].filter(q_id => {
                let question = getQuestionByIdInAllQuestionsData(q_id, ALLQUESTIONS)
                return years.includes(question['origin']['exam'])
            })
            for (let q_id of filtered) {
                let question = getQuestionByIdInAllQuestionsData(q_id, ALLQUESTIONS);
                if (question && !result.some(q => q.id === question.id)) {
                    result.push(question);
                }
            }
        }
    } else result = schema[speciality][theme]['array'].filter(q_id => {
        let question = getQuestionByIdInAllQuestionsData(q_id, ALLQUESTIONS)
        return years.includes(question['origin']['exam'])
    }) 
    return result.length
}

// Parsear el value del searcher y verificar si existe el path en el schema
function confirmIfPathExists(value, schema) {
    value = clean_string_spaces(value)
    let splitted = value.split(/\//)
    if (splitted.length == 0 || splitted.length > 2 || value == '') return false
    if (splitted.length == 1 || value[value.length - 1] == '/') {
        value = splitted[0].replace('/', '')
        if (Object.keys(schema).includes(value)) return value
        else return false
    }
    else if (splitted.length == 2){
        let [sp, th] = splitted
        if (Object.keys(schema).includes(sp)) {
            if (Object.keys(schema[sp]).includes(th)) return `${sp} / ${th}`
            else return false
        } else return false
    }
}

function getQuestionByIdInAllQuestionsData(id, allQuestionsData) {
    let result = allQuestionsData.find(q => q["id"] == id)
    return result
}


function getQuestions(paths, schema, allQuestionsData, years) {
    let allQuestions = []
    if (paths.length == 0) {
        for (let speciality of Object.keys(schema)) {
            for (let theme of Object.keys(schema[speciality])){
                for (let question_id of schema[speciality][theme]['array']) {
                    let question = getQuestionByIdInAllQuestionsData(question_id, allQuestionsData)
                    if (years.includes(question['origin']['exam'])) {
                        let questionAlrreadyAdded = allQuestions.find(q => q['id'] === question['id'])
                        if (!questionAlrreadyAdded) allQuestions.push(question)
                    }
                }
            }
        }
    } else {
        for (let path of paths){
            let splitted = path.split(/\//)
            if (splitted.length == 0 || splitted.length > 2 || path == '') return result
            if (splitted.length == 1) {
                let speciality = splitted[0]
                for (let theme of Object.keys(schema[speciality])){
                    for (let question_id of schema[speciality][theme]['array']){
                        let question = getQuestionByIdInAllQuestionsData(question_id, allQuestionsData)
                        if (years.includes(question['origin']['exam'])) {
                            let questionAlrreadyAdded = allQuestions.find(q => q['id'] === question['id'])
                            if (!questionAlrreadyAdded) allQuestions.push(question)
                        }
                    }
                }
            } else if(splitted.length == 2) {
                let [speciality, theme] = splitted
                for (let question_id of schema[speciality][theme]['array']) {
                    let question = getQuestionByIdInAllQuestionsData(question_id, allQuestionsData)
                    if (years.includes(question['origin']['exam'])) {
                        let questionAlrreadyAdded = allQuestions.find(q => q['id'] === question['id'])
                        if (!questionAlrreadyAdded) allQuestions.push(question)
                    }
                }
            }
        }
    }
    function sortQuestions(a, b) {
        if (parseInt(a['origin']['exam']) === parseInt(b['origin']['exam'])) {
            return a['index'] - b['index'];
        } else {
            return b['origin']['exam'].localeCompare(a['origin']['exam']);
        }
    }
    allQuestions.sort(sortQuestions)
    return allQuestions
}

async function getPaths(question) {
    let SCHEMA
    let allPaths = []
    await fetch('./data/schema.json')
        .then(response => response.json())
        .then(data => {
            SCHEMA = data
        })
        .catch(error => {
            console.error('Error al obtener los datos JSON:', error);
        });
    for (let speciality of Object.keys(SCHEMA)) {
        for (let theme of Object.keys(SCHEMA[speciality])){
            SCHEMA[speciality][theme]["array"].forEach(q_id => {
                if (q_id === question.id) allPaths.push({"speciality": speciality, "theme": theme});
            })
        }
    }
    return allPaths
}

export default {
    searchInputHandler,
    confirmIfPathExists,
    getQuestions,
    getPaths
}