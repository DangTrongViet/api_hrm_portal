import * as express from 'express';
const router = express.Router();
import RoleController from '@controller/role.controller';

router.get('/department', RoleController.departments);
router.get('/rolesName', RoleController.rolesName);
// CRUD
router.get('/', RoleController.list); // ?q=&page=&pageSize=&withPermissions=1
router.get('/:id', RoleController.get);
router.post('/', RoleController.create);
router.put('/:id', RoleController.update);
router.patch('/:id', RoleController.update);
router.delete('/:id', RoleController.remove);

// Permissions on role
router.post('/:id/permissions', RoleController.addPermissions); // append
router.put('/:id/permissions', RoleController.setPermissions); // replace
router.delete('/:id/permissions/:permId', RoleController.removePermission);

export default router;
