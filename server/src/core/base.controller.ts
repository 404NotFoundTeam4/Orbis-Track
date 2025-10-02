import autoBind from 'auto-bind'

/**
 * Description: คอนโทรลเลอร์แม่แบบ เอาไว้ให้คลาสลูกสืบไปใช้
 * Input : -
 * Output : อินสแตนซ์ที่เมธอดผูกกับ 'this' ให้แล้ว ใช้ที่ไหน 'this' ก็ไม่หลุด
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseController {
    constructor() {
        // เวลาเอาไปใช้เป็น callback/handler จะได้ไม่เจอปัญหา 'this' หาย
        autoBind(this)
    }
}