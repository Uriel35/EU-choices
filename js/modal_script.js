function defineModal(openButton=undefined, modal, ctn, closeButton=undefined) {
    if (openButton) openButton.addEventListener('click', () => {
        modal.classList.add('flex-active')
        document.body.classList.add("modal-open"); // Para que no se scrollee la pagina cuando esta abierto un modal.
    })
    modal.addEventListener('click', (e) => {
        if (e.target.contains(modal)) {
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

defineModal(document.getElementById('hsmlp-button'), document.getElementById('hsmlp-modal'), document.getElementById('hsmlp-ctn'), document.getElementById('close-hsmlp-modal'))
defineModal(document.getElementById('readme-button'), document.getElementById('readme-modal'), document.getElementById('readme-ctn'), document.getElementById('close-readme-modal'))
defineModal(document.getElementById('statistics-button'), document.getElementById('statistics-modal'), document.getElementById('statistics-ctn'), document.getElementById('close-statistics-modal'))
defineModal(undefined, document.getElementById('error-modal'), document.getElementById('error-modal-ctn'))

defineModal(document.getElementById('show-circle-modal-button'), document.getElementById('circle-modal'), document.getElementById('circles-modal-ctn'), document.getElementById('close-circles-modal'))
defineModal(document.getElementById('report-question-button'), document.getElementById('report-question-modal'), document.getElementById('report-question-modal-ctn'), document.getElementById('close-report-question-modal'))


function addAnaltyticEvent(tgt, name) {
  tgt.addEventListener("click", () => {
    console.log("Enviado a Data Analytics")
    gtag('event', name, {
          'event_category': name,
          'event_label': name
        });
  })
}

let eu_stats_link = document.getElementById("eu-stats")
let applicants_link = document.getElementById("applicants-stats")
addAnaltyticEvent(eu_stats_link, "EU stats")
addAnaltyticEvent(applicants_link, "Applicants stats")

let openHsmlpModalButton = document.getElementById("hsmlp-button")
openHsmlpModalButton.addEventListener("click", () => {
  gtag('event', 'HSMLP modal', {
        'event_category': 'HSMLP modal',
        'event_label': 'HSMLP modal'
      });
})
let hsmlpInstagramButton = document.getElementById("hsmlp-instagram-button")
hsmlpInstagramButton.addEventListener("click", () => {
  gtag('event', 'HSMLP Instagram', {
        'event_category': 'HSMLP Instagram',
        'event_label': 'HSMLP Instagram'
      });
})

const hsmlpCtn = document.getElementById("hsmlp-button")
function vibrate(element){
  setTimeout(function() {
    element.classList.add("vibrate");
  }, 100);
  
  setTimeout(function() {
    element.classList.remove("vibrate");
  }, 2000);
}

vibrate(hsmlpCtn)

setInterval(function() {
  vibrate(hsmlpCtn);
}, 120000); // 120 seg (2 minutos)

export default {defineModal}