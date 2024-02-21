import { Router } from "express";
import authRoute from "../modules/auth/auth.route";
import userRoute from "../modules/user/user.route";

const router = Router();

interface IRoute {
  path: string;
  route: Router;
}

const proRoute: IRoute[] = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
];

proRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
