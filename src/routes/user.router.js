import { Router } from "express";
import { editProfile, login, signup, uploadImage, logout } from "../controller/user.controller.js";
import { upload } from "../middleware/uploadImage.middleware.js";

const router = Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout/:id', logout);

router.post('/imageupload', upload.array('imageFirst', 10), uploadImage);

router.patch('/editProfile/:id', editProfile);

export default router;