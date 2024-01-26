const { hashSync, genSaltSync, compareSync, hash } = require("bcrypt");

const { sign } = require("jsonwebtoken");
const pool = require("../../config/database");
const stripe = require("stripe")("sk_test_lEDAxsdPMDvIlkbJTsLXf05R");
const {
  getUserByUserEmail,
  getUsers,
  forgot,
  reset,
  contactus,
  getuserdetails,
  subscribe,
  getSubscribeByEmail,
  getPincode,
  getnotifications,
  create,
  create_item,
  getusersboards,
  getUserByUserEmailuser,
  attachboards,
  getalluserstoboards,
  updateuser,
  createb,
} = require("./user.service");

module.exports = {
  login: (req, res) => {
    const body = req.body;

    console.log("loginpassed", body);

    getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          data: "Invalid email or password",
        });
      }

      const result = compareSync(body.password, results.password);

      if (result) {
        results.password = undefined;
        const jsontoken = sign(
          { result: results },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "12h",
          }
        );
        return res.json({
          success: 1,
          message: "login successfully",
          token: jsontoken,
          user: results,
        });
      } else {
        return res.json({
          success: 0,
          data: "Invalid email or password",
        });
      }
    });
  },
  loginuser: (req, res) => {
    const body = req.body;

    getUserByUserEmailuser(body.email, async (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          data: "Invalid email or password",
        });
      }

      let result = compareSync(body.password, results.password);

      //result = true;
      if (result) {
        results.password = undefined;
        const jsontoken = sign(
          { result: results },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "12h",
          }
        );
        //console.log("jsontoken", jsontoken);
        return res.json({
          success: 1,
          message: "login successfully",
          token: jsontoken,
          user: results,
        });
      } else {
        return res.json({
          success: 0,
          data: "Invalid email or password",
        });
      }
    });
  },
  Subscribe: (req, res) => {
    const body = req.body;

    subscribe(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection errror",
        });
      }
      return res.status(200).json({
        success: 1,
        data: "Subscription done",
      });
    });
  },
  Create: (req, res) => {
    const body = req.body;
    console.log("body recieved", body);

    create(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection errror",
        });
      }
      return res.status(200).json({
        success: 1,
        data: "Account created",
      });
    });
  },
  CreateB: (req, res) => {
    const body = req.body;
    console.log("body recieved", body);

    createb(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection errror",
        });
      }
      return res.status(200).json({
        success: 1,
        data: "Account created",
      });
    });
  },
  Create_item: (req, res) => {
    const body = req.body;

    create_item(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection errror",
        });
      }
      return res.status(200).json({
        success: 1,
        data: "Account created",
      });
    });
  },
  Attachboards: (req, res) => {
    const body = req.body;

    attachboards(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection errror",
        });
      }
      return res.status(200).json({
        success: 1,
        data: "Board attached",
      });
    });
  },
  Checkemail: (req, res) => {
    const body = req.body;

    getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results) {
        return res.json({
          success: 1,
          data: "Email exist",
        });
      } else {
        return res.json({
          success: 0,
          data: "Email available",
        });
      }
    });
  },
  Stripe_intent: async (req, res) => {
    const body = req.body;

    const customer = await stripe.customers.create({
      email: body?.userdetail?.email,
    });

    const exp = body?.card?.expiry.split("/");
    let paymentMethod;
    try {
      paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          number: body?.card?.cardnumber,
          exp_month: exp[0],
          exp_year: exp[1],
          cvc: "123",
        },
      });
    } catch (err) {
      console.log("this is error", err);
      let poststatus = { data: err, status: "declined" };
      console.log("poststatus", poststatus);
      return res.status(200).json(poststatus);
    }
    // console.log("payment method error", paymentMethod);
    const payment_method_status = await stripe.paymentMethods.attach(
      paymentMethod.id,
      {
        customer: customer.id,
      }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: "1000",
      currency: "usd",
      payment_method_types: ["card"],
      customer: customer.id,
    });

    console.log("paymentIntent", paymentIntent);

    try {
      const confirmation = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmation.status === "succeeded") {
      } else if (confirmation.status === "requires_action") {
        console.log("Payment requires additional authentication");
      } else {
        console.log("Payment failed");
      }

      //console.log("confirmation", confirmation);
      res.json({ data: confirmation });
    } catch (err) {
      console.log("kakdkaksda", err);
      res.status(200).json({ error: err.message });
    }
  },
  Sproducts: async (req, res) => {
    //console.log("this is ins sproducts");
    try {
      const { data } = await stripe.products.list({
        type: "service",
        active: true,
      });

      //res.json(prices);
      //console.log("products", data);
      //res.json(data);
      return res.json({
        success: 1,
        data: data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  },
  Createsubscription: async (req, res) => {
    //console.log("this is ins sproducts");
    try {
      const { data } = await stripe.products.list({
        type: "service",
        active: true,
      });

      //res.json(prices);
      //console.log("products", data);
      //res.json(data);
      return res.json({
        success: 1,
        data: data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  },
  Payment_history: async (req, res) => {
    const body = req.body;
    const user = req.decoded.result;

    //console.log("payment history body", body);
    //console.log("payment history user", user);

    try {
      const paymentHistory = await stripe.paymentIntents.list({
        customer: user.stripe_customer_id,
      });
      console.log("paymenthistory", paymentHistory);
      res.status(200).send(paymentHistory);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ error: "An error occurred while fetching payment history." });
    }
  },
  Create_plan: async (req, res) => {
    const body = req.body;
    const user = req.decoded.result;

    //console.log("payment history body", body);
    //console.log("payment history user", user);

    try {
      const plan = await stripe.plans.create({
        amount,
        currency,
        interval,
        product,
      });

      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error creating plan", error });
    }
  },

  List_Plans: async (req, res) => {
    const body = req.body;
    const user = req.decoded.result;

    //console.log("payment history body", body);
    //console.log("payment history user", user);

    try {
      const plans = await stripe.plans.list({ limit: 10 });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching plans", error });
    }
  },
  Checkpincode: (req, res) => {
    const body = req.body;

    getPincode(body.pincode, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results) {
        return res.json({
          success: 1,
          data: results,
        });
      } else {
        return res.json({
          success: 0,
          data: "Pincode not available",
        });
      }
    });
  },

  Checksubscribe: (req, res) => {
    const body = req.body;

    getSubscribeByEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results) {
        return res.json({
          success: 1,
          data: "Email exist",
        });
      } else {
        return res.json({
          success: 0,
          data: "Email available",
        });
      }
    });
  },
  Contactus: (req, res) => {
    const body = req.body;

    contactus(body, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (results) {
        return res.json({
          success: 1,
          data: "Email sent",
        });
      } else {
        return;
      }
    });
  },
  getUsersboards: (req, res) => {
    let body = req.body;
    //console.log("this body", body);
    getusersboards(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  getAllboardstouser: (req, res) => {
    let body = req.body;

    getalluserstoboards(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  getUsers: (req, res) => {
    getUsers((err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  getUserDetails: (req, res) => {
    const id = req.params.id;
    const user = req.decoded.result;

    getuserdetails(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  updateUser: (req, res) => {
    const user = req.decoded.result;

    if (user.id == req.body.user_id) {
      updateuser(req.body, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        return res.json({
          success: 1,
          data: "Account updated",
        });
      });
    }
  },
  Forgot: (req, res) => {
    const body = req.body;

    forgot({ body, req }, (err, results) => {
      if (err) {
        console.log(err);
        return res.send({
          success: 0,
          message: err,
        });
      } else {
        return res.json({
          success: 1,
          message: "updated successfully",
        });
      }
    });
  },
  ResetPassword: (req, res) => {
    const body = req.body;

    reset({ body, req }, (err, results) => {
      if (err) {
        console.log(err);
        return res.send({
          success: 0,
          message: err,
        });
      } else {
        return res.json({
          success: 1,
          message: "updated successfully",
        });
      }
    });
  },
  googleLogin: (req, res) => {
    const { email, given_name, family_name } = req.body;

    getUserByUserEmail(email, (err1, result1) => {
      if (err1) {
        return res.json({
          success: false,
          data: "user not Found",
        });
      } else {
        //console.log("asdsd", result1);
        if (result1) {
          const jsontoken = sign(
            { result: result1 },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "12h",
            }
          );
          return res.json({
            success: 1,
            user: result1,
            message: "login successfully",
            token: jsontoken,
          });
        } else {
          console.log(err1);
          return res.json({
            success: 0,
            data: "user not logged in by google",
          });
        }
      }
    });
  },

  getNotifications: (req, res) => {
    getnotifications(req, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
};
