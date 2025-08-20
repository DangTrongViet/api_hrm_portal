// src/routes/permission.ts
import { Router } from 'express';
import PermissionController from '@controller/permission.controller';

const router = Router();

router.get('/', PermissionController.list); // ?q=&page=&pageSize=&withRoles=1
router.get('/:id', PermissionController.get);
router.post('/', PermissionController.create);
router.put('/:id', PermissionController.update);
router.patch('/:id', PermissionController.update);
router.delete('/:id', PermissionController.remove);

export default router;
