let QUESTIONS_BY_ID_CACHE = new Map()
let QUESTION_YEAR_BY_ID_CACHE = new Map()
let PATHS_BY_QUESTION_ID_CACHE = new Map()
let QUESTION_IDS_BY_THEME_PATH_CACHE = new Map()
let QUESTION_IDS_BY_SPECIALITY_CACHE = new Map()
let SPECIALITIES_CACHE = []
let THEMES_BY_SPECIALITY_CACHE = new Map()
let ALL_QUESTION_IDS_CACHE = []
let COUNTER_CACHE = new Map()

function initializeData(schema, allQuestionsData) {
    QUESTIONS_BY_ID_CACHE = new Map()
    QUESTION_YEAR_BY_ID_CACHE = new Map()
    PATHS_BY_QUESTION_ID_CACHE = new Map()
    QUESTION_IDS_BY_THEME_PATH_CACHE = new Map()
    QUESTION_IDS_BY_SPECIALITY_CACHE = new Map()
    THEMES_BY_SPECIALITY_CACHE = new Map()
    COUNTER_CACHE = new Map()

    SPECIALITIES_CACHE = Object.keys(schema)
    ALL_QUESTION_IDS_CACHE = allQuestionsData.map(question => question.id)

    for (let question of allQuestionsData) {
        QUESTIONS_BY_ID_CACHE.set(question.id, question)
        QUESTION_YEAR_BY_ID_CACHE.set(question.id, question.origin.exam)
    }

    for (let speciality of SPECIALITIES_CACHE) {
        const themes = Object.keys(schema[speciality])
        const specialityQuestionIds = new Set()

        THEMES_BY_SPECIALITY_CACHE.set(speciality, themes)

        for (let theme of themes) {
            const questionIds = schema[speciality][theme].array
            const pathKey = formatPath(speciality, theme)

            QUESTION_IDS_BY_THEME_PATH_CACHE.set(pathKey, questionIds)

            for (let q_id of questionIds) {
                specialityQuestionIds.add(q_id)

                if (!PATHS_BY_QUESTION_ID_CACHE.has(q_id)) {
                    PATHS_BY_QUESTION_ID_CACHE.set(q_id, [])
                }
                PATHS_BY_QUESTION_ID_CACHE.get(q_id).push({ speciality, theme })
            }
        }

        QUESTION_IDS_BY_SPECIALITY_CACHE.set(speciality, Array.from(specialityQuestionIds))
    }
}

function clean_string_spaces(value){
    value = value.trim()
    value = value.replace(/\s{2,}/g, ' ')
    value = value.replace(/\s*\/\s*/g, '/')
    value = value.toLowerCase()
    return value
}

function formatPath(speciality, theme) {
    return `${speciality} / ${theme}`
}

function getYearsKey(years) {
    return [...years].sort().join("|")
}

function getYearsSet(years) {
    return years instanceof Set ? years : new Set(years)
}

function getCounterCacheEntry(years) {
    const yearsKey = getYearsKey(years)
    if (!COUNTER_CACHE.has(yearsKey)) {
        COUNTER_CACHE.set(yearsKey, new Map())
    }
    return COUNTER_CACHE.get(yearsKey)
}

function countQuestionIdsForYears(questionIds, years) {
    const yearsSet = getYearsSet(years)
    let count = 0

    for (let questionId of questionIds) {
        if (yearsSet.has(QUESTION_YEAR_BY_ID_CACHE.get(questionId))) {
            count++
        }
    }

    return count
}

function getQuestionIdsForPath(path) {
    const normalizedPath = clean_string_spaces(path)
    const splitted = normalizedPath.split(/\//)

    if (splitted.length === 1) {
        return QUESTION_IDS_BY_SPECIALITY_CACHE.get(splitted[0]) || []
    }

    if (splitted.length === 2) {
        return QUESTION_IDS_BY_THEME_PATH_CACHE.get(formatPath(splitted[0], splitted[1])) || []
    }

    return []
}

function searchInputHandler(value, schema, years){
    let result = []
    if (value == undefined || value == '') {
        for (let speciality of SPECIALITIES_CACHE) {
            let spCounter = getQuestionCounter(speciality, false, years)
            result.push({'speciality': speciality, 'counter': spCounter})

            for (let theme of THEMES_BY_SPECIALITY_CACHE.get(speciality) || []) {
                let qCounter = getQuestionCounter(speciality, theme, years)
                result.push({'speciality': speciality, 'theme': theme, 'counter': qCounter})
            }
        }
        return result
    }

    value = clean_string_spaces(value)
    let splitted = value.split(/\//)
    if (splitted.length > 2) return result

    if (splitted.length == 1 || value[value.length - 1] == '/'){
        let word = splitted[0]
        let matchedSpecialities = findSpeciality(word, years)
        result = result.concat(matchedSpecialities)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])

        for (let speciality of justSpecialitiesMatched) {
            for (let theme of THEMES_BY_SPECIALITY_CACHE.get(speciality) || []) {
                let qCounter = getQuestionCounter(speciality, theme, years)
                result.push({'speciality': speciality, 'theme': theme, 'counter': qCounter})
            }
        }

        for (let speciality of SPECIALITIES_CACHE){
            let matchedThemes = findTheme(word, speciality, schema, years)
            result = result.concat(matchedThemes)
        }
    }
    else if (splitted.length == 2){
        let [speciality_str, theme_str] = splitted
        let matchedSpecialities = findSpeciality(speciality_str, years)
        let justSpecialitiesMatched = matchedSpecialities.map(x => x['speciality'])

        for (let speciality of justSpecialitiesMatched){
            let matchedThemes = findTheme(theme_str, speciality, schema, years)
            result = result.concat(matchedThemes)
        }
    }

    return result
}

function findSpeciality(value, years) {
    let result = []

    for (let speciality of SPECIALITIES_CACHE) {
        if (speciality.includes(value)){
            let qCounter = getQuestionCounter(speciality, false, years)
            result.push({'speciality': speciality, 'counter': qCounter})
        }
    }

    return result
}

function findTheme(value, speciality, schema, years){
    let result = []

    for (let theme of THEMES_BY_SPECIALITY_CACHE.get(speciality) || []) {
        if (theme.includes(value)) {
            let qCounter = getQuestionCounter(speciality, theme, years)
            result.push({'speciality': speciality, 'theme': theme, 'counter': qCounter})
        }
        else if(schema[speciality][theme].hasOwnProperty('analogos')){
            for (let analogo of schema[speciality][theme]["analogos"]){
                if (analogo.includes(value)) {
                    let qCounter = getQuestionCounter(speciality, theme, years)
                    result.push({'speciality': speciality, 'theme': theme, 'analogo': analogo, 'counter': qCounter})
                    break
                }
            }
        }
    }

    return result
}

function getQuestionCounter(speciality, theme, years) {
    const cacheEntry = getCounterCacheEntry(years)
    const pathKey = theme ? formatPath(speciality, theme) : speciality

    if (cacheEntry.has(pathKey)) {
        return cacheEntry.get(pathKey)
    }

    const questionIds = theme
        ? QUESTION_IDS_BY_THEME_PATH_CACHE.get(formatPath(speciality, theme)) || []
        : QUESTION_IDS_BY_SPECIALITY_CACHE.get(speciality) || []

    const count = countQuestionIdsForYears(questionIds, years)
    cacheEntry.set(pathKey, count)
    return count
}

function countQuestions(paths, years) {
    const yearsSet = getYearsSet(years)

    if (paths.length === 0) {
        return countQuestionIdsForYears(ALL_QUESTION_IDS_CACHE, yearsSet)
    }

    const uniqueQuestionIds = new Set()

    for (let path of paths) {
        for (let questionId of getQuestionIdsForPath(path)) {
            if (yearsSet.has(QUESTION_YEAR_BY_ID_CACHE.get(questionId))) {
                uniqueQuestionIds.add(questionId)
            }
        }
    }

    return uniqueQuestionIds.size
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
            if (Object.keys(schema[sp]).includes(th)) return formatPath(sp, th)
            else return false
        } else return false
    }
}

function getQuestionByIdInAllQuestionsData(id, allQuestionsData) {
    if (QUESTIONS_BY_ID_CACHE.size > 0) {
        return QUESTIONS_BY_ID_CACHE.get(id)
    }

    return allQuestionsData.find(q => q["id"] == id)
}

function getQuestions(paths, allQuestionsData, years) {
    const yearsSet = getYearsSet(years)
    const selectedQuestionIds = new Set()
    let sourceQuestionIds = []

    if (paths.length === 0) {
        sourceQuestionIds = ALL_QUESTION_IDS_CACHE
    } else {
        for (let path of paths) {
            let splitted = path.split(/\//)
            if (splitted.length == 0 || splitted.length > 2 || path == '') return []

            for (let questionId of getQuestionIdsForPath(path)) {
                selectedQuestionIds.add(questionId)
            }
        }
        sourceQuestionIds = Array.from(selectedQuestionIds)
    }

    const allQuestions = sourceQuestionIds
        .filter(questionId => yearsSet.has(QUESTION_YEAR_BY_ID_CACHE.get(questionId)))
        .map(questionId => getQuestionByIdInAllQuestionsData(questionId, allQuestionsData))

    allQuestions.sort((a, b) => {
        if (parseInt(a['origin']['exam']) === parseInt(b['origin']['exam'])) {
            return a['index'] - b['index']
        }
        return b['origin']['exam'].localeCompare(a['origin']['exam'])
    })

    return allQuestions
}

function getPaths(question) {
    if (!question) return []
    return PATHS_BY_QUESTION_ID_CACHE.get(question.id) || []
}

export default {
    initializeData,
    searchInputHandler,
    countQuestions,
    confirmIfPathExists,
    getQuestions,
    getPaths
}
