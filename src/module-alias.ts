import moduleAlias from 'module-alias'
import { ROOT_PATH } from './config/main-config'

moduleAlias.addAliases({
  '@': `${ROOT_PATH}/src`
})
