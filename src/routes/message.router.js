import { Router  } from "express";
import { addparticipantingroup, createGroup, getallgroup, getalluser, getconversation, getUserChat, leaveGroup } from "../controller/message.controller.js";
import { ProtectMiddleware } from "../middleware/auth.middleware.js";
import { checkAccessForGroup } from "../middleware/checkGroupAccess.middleware.js";

const router = Router();

router.get('/getconversation',ProtectMiddleware,getconversation);

router.get('/getalluser',ProtectMiddleware,getalluser);

router.get('/getallgroup',ProtectMiddleware,getallgroup);

router.post('/creategroup',ProtectMiddleware,createGroup);

router.post('/addparticipantingroup',ProtectMiddleware,checkAccessForGroup,addparticipantingroup);

router.post('/leaveGroup',ProtectMiddleware,leaveGroup);

router.get('/getUserChat/:userId',ProtectMiddleware,getUserChat);

export default router;