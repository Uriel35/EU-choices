const REGISTERED_MODALS = new Set()

function openModal(modal) {
    if (!modal) return
    modal.classList.add('flex-active')
    document.body.classList.add("modal-open")
}

function closeModal(modal) {
    if (!modal) return
    modal.classList.remove("flex-active")

    const anyModalOpen = Array.from(REGISTERED_MODALS).some(
        registeredModal => registeredModal.classList.contains("flex-active")
    )

    if (!anyModalOpen) {
        document.body.classList.remove("modal-open")
    }
}

function defineModal(openButton=undefined, modal, ctn, closeButton=undefined) {
    if (!modal) return

    REGISTERED_MODALS.add(modal)

    if (openButton) {
        openButton.addEventListener('click', () => {
            openModal(modal)
        })
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal)
        }
    })

    if(closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal(modal)
        })
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key !== "Escape") return

    REGISTERED_MODALS.forEach(modal => {
        if (modal.classList.contains("flex-active")) {
            closeModal(modal)
        }
    })
})

defineModal(document.getElementById('hsmlp-button'), document.getElementById('hsmlp-modal'), document.getElementById('hsmlp-ctn'), document.getElementById('close-hsmlp-modal'))
defineModal(document.getElementById('readme-button'), document.getElementById('readme-modal'), document.getElementById('readme-ctn'), document.getElementById('close-readme-modal'))
defineModal(document.getElementById('statistics-button'), document.getElementById('statistics-modal'), document.getElementById('statistics-ctn'), document.getElementById('close-statistics-modal'))
defineModal(undefined, document.getElementById('error-modal'), document.getElementById('error-modal-ctn'))

defineModal(document.getElementById('show-circle-modal-button'), document.getElementById('circle-modal'), document.getElementById('circles-modal-ctn'), document.getElementById('close-circles-modal'))
defineModal(document.getElementById('report-question-button'), document.getElementById('report-question-modal'), document.getElementById('report-question-modal-ctn'), document.getElementById('close-report-question-modal'))

// PARA QUE APAREZCA EL QUIZ MODAL AL INICIO
// defineModal(document.getElementById('open-quiz-modal'), document.getElementById('quiz-modal'), document.getElementById('quiz-modal-ctn'), document.getElementById('close-quiz-modal'))
// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById("quiz-modal").classList.add("flex-active")
// });
// PARA QUE APAREZCA EL QUIZ MODAL AL INICIO
defineModal(undefined, document.getElementById('initial-modal'), document.getElementById('initial-modal-ctn'), document.getElementById('close-initial-modal'))
document.addEventListener('DOMContentLoaded', function() {
  openModal(document.getElementById("initial-modal"))
});

// defineModal(document.getElementById('hsmlp-button'), document.getElementById('hsmlp-modal'), document.getElementById('hsmlp-ctn'), document.getElementById('close-hsmlp-modal'))
// document.addEventListener('DOMContentLoaded', function() {
  // document.getElementById("hsmlp-modal").classList.add("flex-active")
  // document.getElementById("good-luck-modal").classList.add("flex-active")
// });


//  *************** DATA ANALYTICS EVENTS *****************
function addAnaltyticEvent(tgt, name) {
  if (!tgt || typeof gtag !== "function") return
  tgt.addEventListener("click", () => {
      if (!sessionStorage.getItem(`${name}_session_storage`)) {
        gtag('event', name, {
              'event_category': name,
              'event_label': name
            });
        sessionStorage.setItem(`${name}_session_storage`, 'true');
      } else { return }
  })
}
let eu_stats_link = document.getElementById("eu-stats")
let applicants_link = document.getElementById("applicants-stats")
let hsmlpInstagramButton = document.getElementById("hsmlp-instagram-button")
let openHsmlpModalButton = document.getElementById("hsmlp-button")
let infectoInstagramButton = document.getElementById("infectohigasm-instagram-button")
let metodologyStats2024 = document.getElementById("metodology-stats-2024")
addAnaltyticEvent(eu_stats_link, "EU stats")
addAnaltyticEvent(applicants_link, "Applicants stats")
addAnaltyticEvent(openHsmlpModalButton, "HSMLP modal")
addAnaltyticEvent(infectoInstagramButton, "Infectologia Instagram")
addAnaltyticEvent(hsmlpInstagramButton, "Clinica Instagram")
addAnaltyticEvent(metodologyStats2024, "Metodologia stats 2024")

// openHsmlpModalButton.addEventListener("click", () => {
//   gtag('event', 'HSMLP modal', {
//         'event_category': 'HSMLP modal',
//         'event_label': 'HSMLP modal'
//       });
// })

// hsmlpInstagramButton.addEventListener("click", () => {
//   gtag('event', 'HSMLP Instagram', {
//         'event_category': 'HSMLP Instagram',
//         'event_label': 'HSMLP Instagram'
//       });
// })

const hsmlpCtn = document.getElementById("hsmlp-button")
function vibrate(element){
  if (!element) return
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

export default {defineModal, closeModal, openModal}
