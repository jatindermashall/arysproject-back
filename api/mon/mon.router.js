const router = require("express").Router();

const {
  getTaskdetail,
  createWebhook,
  Webhookdata,
  createtask,
  listTasks,
} = require("./mon.controller");
router.post("/webhookdata", Webhookdata);
const { checkToken } = require("../../auth/token_validation");
const upload = require("../../config/multer");
router.post("/gettaskdetail", checkToken, getTaskdetail);
router.post("/createtask", upload.single("file"), checkToken, createtask);
router.post("/listtasks", checkToken, listTasks);

router.post("/createwebhook", checkToken, createWebhook);

module.exports = router;
