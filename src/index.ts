import './env';
import Koa from 'koa';
import { router } from './router';
import { usersDetailPath, usersPath } from './users/users.paths';

const app = new Koa();

router.register(usersPath, usersDetailPath);
router.setup(app);

const port = 4000;
app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
