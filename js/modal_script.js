function defineModal(openButton=undefined, modal, ctn, closeButton=undefined) {
    if (openButton) openButton.addEventListener('click', () => {
        modal.classList.add('flex-active')
        document.body.classList.add("modal-open"); // Para que no se scrollee la pagina cuando esta abierto un modal.
    })
    modal.addEventListener('click', (e) => {
        if (e.target.contains(ctn)) {
            modal.classList.remove('flex-active')
            document.body.classList.remove("modal-open");
        }
    })
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            modal.classList.remove("flex-active")
            document.body.classList.remove("modal-open");
        }
    })
    if(closeButton) {
        closeButton.addEventListener('click', () => {
            modal.classList.remove('flex-active')
            document.body.classList.remove("modal-open");
        })
    }
}

defineModal(document.getElementById('readme-button'), document.getElementById('readme-modal'), document.getElementById('readme-ctn'), document.getElementById('close-readme-modal'))
defineModal(document.getElementById('statistics-button'), document.getElementById('statistics-modal'), document.getElementById('statistics-ctn'), document.getElementById('close-statistics-modal'))
defineModal(undefined, document.getElementById('error-modal'), document.getElementById('error-modal-ctn'))

defineModal(document.getElementById('show-circle-modal-button'), document.getElementById('circle-modal'), document.getElementById('circles-modal-ctn'), document.getElementById('close-circles-modal'))
defineModal(document.getElementById('report-question-button'), document.getElementById('report-question-modal'), document.getElementById('report-question-modal-ctn'), document.getElementById('close-report-question-modal'))


export default {defineModal}