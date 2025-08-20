import * as express from 'express';
const router = express.Router();
import { EmpController } from '@controller';
router.get('/users-options', EmpController.userOptions);
router.get('/', EmpController.list);
router.get('/:id', EmpController.get);
router.post('/', EmpController.create);
router.patch('/:id', EmpController.update);
router.delete('/:id', EmpController.remove);

export default router;
