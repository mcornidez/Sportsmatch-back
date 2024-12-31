import {Router} from "express";
import {urlencoded} from "body-parser";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";
import FieldsController from '../controllers/fields.controller'

export default class FieldsRoutes{
    public router: Router = Router({ mergeParams: true });
    private readonly controller: FieldsController = new FieldsController();

    constructor() {
        this.init()
    }

    private init(){
        this.router.use(urlencoded({ extended: true }));

        this.router.post('/', clubAuthMiddleware, this.controller.postField)
        this.router.get('/:clubId', this.controller.getFields)
        this.router.put('/:fieldId', clubAuthMiddleware,this.controller.updateField)
        this.router.delete('/:fieldId', clubAuthMiddleware, this.controller.deleteField)
    }
}