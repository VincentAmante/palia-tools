import { config, library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faBars,
  faCaretDown,
  faCircleInfo,
  faCircleQuestion,
  faCopy,
  faDroplet,
  faEraser,
  faForwardFast,
  faGift,
  faHeart,
  faInfoCircle,
  faJar,
  faMap,
  faPaste,
  faPlus,
  faRecycle,
  faSeedling,
  faShield,
  faSquarePlus,
  faStar,
  faTableCellsLarge,
  faTools,
  faTrash,
  faTriangleExclamation,
  faTurnDown,
  faWheatAwn,
} from '@fortawesome/free-solid-svg-icons'

import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(
  faShield,
  faDroplet,
  faForwardFast,
  faStar,
  faWheatAwn,
  faEraser,
  faCopy,
  faPaste,
  faTrash,
  faTriangleExclamation,
  faPlus,
  faInfoCircle,
  faCaretDown,
  faArrowUpRightFromSquare,
  faCircleInfo,
  faCircleQuestion,
  faJar,
  faSeedling,
  faRecycle,
  faHeart,
  faTools,
  faTableCellsLarge,
  faSquarePlus,
  faTurnDown,
  faArrowLeft,
  faBars,
  faGift,
  faMap,
  faGithub,
)

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
