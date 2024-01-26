const router = require("express").Router();
const {
  login,
  getUsers,
  Forgot,
  ResetPassword,
  getUserDetails,
  Checkemail,
  Contactus,
  googleLogin,
  Subscribe,
  Checksubscribe,
  Checkpincode,
  getNotifications,
  Create,
  Stripe_intent,
  getUsersboards,
  loginuser,
  Attachboards,
  getAllboardstouser,
  updateUser,
  Payment_history,
  Create_plan,
  List_Plans,
  Sproducts,
  Createsubscription,
  Create_item,
  CreateB,
} = require("./user.controller");
router.post("/login", login);
router.post("/loginuser", loginuser);
router.post("/google-login", googleLogin);

router.post("/create", Create);
router.post("/create-b", CreateB);
router.post("/attachboards", Attachboards);
router.post("/userboards", getUsersboards);
router.post("/alluserstoboards", getAllboardstouser);
router.post("/stripe_intent", Stripe_intent);

router.post("/forgot", Forgot);
router.post("/checkemail", Checkemail);
router.post("/checksubscribe", Checksubscribe);
router.post("/checkpincode", Checkpincode);
router.post("/contactus", Contactus);
router.post("/reset", ResetPassword);
router.post("/subscribe", Subscribe);
const { checkToken } = require("../../auth/token_validation");
router.post("/payment_history", checkToken, Payment_history);
router.post("/create_plan", checkToken, Create_plan);
router.post("/create_item", checkToken, Create_item);
router.post("/sproducts", checkToken, Sproducts);
router.post("/create_subscription", checkToken, Createsubscription);
router.post("/list_plans", checkToken, List_Plans);
router.post("/", checkToken, getUsers);
router.post("/updateuser", checkToken, updateUser);
router.post("/notifications", checkToken, getNotifications);
router.post("/:id", checkToken, getUserDetails);
router.get("/:id", checkToken, getUserDetails);

module.exports = router;
