import * as express from 'express';
import ContractController from '@controller/contract.controller';

const router = express.Router();

router.get('/', ContractController.list);
router.get('/:id', ContractController.get);
router.post('/', ContractController.create);
router.patch('/:id', ContractController.update);
router.delete('/:id', ContractController.remove);
router.get('/:id/export', ContractController.exportWord);

export default router;
