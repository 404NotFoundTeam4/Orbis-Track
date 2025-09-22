import autoBind from 'auto-bind'

export abstract class BaseController {
    constructor() {
        autoBind(this)
    }
}