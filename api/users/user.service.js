const pool = require("../../config/database");
var randtoken = require("rand-token");
const express = require("express");
const { hash } = require("bcrypt");
const {
  emailSend,
  emailSendto,
  emailSendtospecific,
  emailSendcreateto,
} = require("../email/email.controller");
const app = express();
const moment = require("moment");
const attachtheseboards = (board_ids, user_id) => {
  console.log("board_ids from user b", board_ids);

  const board_ids_new = board_ids.filter((item) => item !== null);

  let values = board_ids_new.map((item) => {
    if (item != null && item != undefined) return [item, user_id];
  });
  //console.log("values", values);
  // return "kkkk";
  return new Promise((resolve, reject) => {
    let query = `insert  into user_boards(board_id,user_id) VALUES ?`;

    pool.query(query, [values], (error, result, fields) => {
      if (error) {
        console.log(error.sql);
        reject(error);
      }

      resolve("values inserted");
    });
  });
};
const deleteboards = (user_id) => {
  console.log("ids");
  return new Promise((resolve, reject) => {
    let query = `delete from user_boards where user_id=?  `;

    pool.query(query, [user_id], (error, result, fields) => {
      if (error) {
        console.log(error.sql);
        reject(error);
      }

      resolve("values inserted");
    });
  });
};
const updateuseractivate = (user_id) => {
  console.log("user updating to active", user_id);
  return new Promise((resolve, reject) => {
    let query = "update users set `active`='1', `new`='0' where id=? ";
    console.log(query);

    pool.query(query, [user_id], (error, result, fields) => {
      if (error) {
        console.log(error.sql);
        reject(error);
      }
      console.log("user udpated result", result);
      resolve("user updated");
    });
  });
};
module.exports = {
  getUserByUserEmail: (email, callBack) => {
    pool.query(
      `select * from users where email=? and active=1`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results[0]);
      }
    );
  },
  getUserByUserEmailuser: (email, callBack) => {
    console.log("user login", email);
    pool.query(
      `select * from users where email=? and active=1 and level='consumer'`,
      [email],
      (error, results, fields) => {
        if (error) {
          //console.log("result", error);
          callBack(error);
        }
        //console.log("result", results);
        return callBack(null, results[0]);
      }
    );
  },
  getSubscribeByEmail: (email, callBack) => {
    pool.query(
      `select * from subscribe where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results[0]);
      }
    );
  },

  getSubscribeByEmail22: (email, callBack) => {
    pool.query(
      `select * from subscribe where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results[0]);
      }
    );
  },
  getPincode: (pincode, callBack) => {
    pool.query(
      `select * from pincodes where pin_code = ?`,
      [pincode],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results[0]);
      }
    );
  },
  getuserdetails: (id, callBack) => {
    pool.query(
      `select * from users where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  updateuser: async (data, callBack) => {
    console.log("data received for update here", data);
    let query = `update users set firstName=?,lastName=?,company=? where id=?`;

    let postarray = [data.firstName, data.lastName, data.company, data.user_id];
    if (data.password) {
      let hashPass = await hash(data.password, 10);
      query = `update users set firstName=?,lastName=?,company=?,password=? where id=?`;
      postarray = [
        data.firstName,
        data.lastName,
        data.company,
        hashPass,
        data.user_id,
      ];
    }

    //console.log("query", query);
    // console.log("postarray", postarray);

    pool.query(query, postarray, (error, results, fields) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  subscribe: (data, callBack) => {
    pool.query(
      `insert into subscribe(email) 
                values(?)`,
      [data.email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  create: async (data, callBack) => {
    console.log("data at create", data);

    let hashPass = await hash(data.password, 10);
    pool.query(
      `insert into users(email,firstName,lastName,password,company,level,active,stripe_customer_id)   values(?,?,?,?,?,?,?,?)`,
      [
        data.email,
        data.firstName,
        data.lastName,
        hashPass,
        data.company,
        "consumer",
        "0",
        data.stripe_customer_id,
      ],
      (error, results, fields) => {
        if (error) {
          console.log(error.sql);
          callBack(error);
        }

        //console.log("created user detail", results);
        var orderID = results.insertId;
        var html =
          "" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;text-transform: capitalize;'>Dear <strong>&ldquo;[name]&rdquo;</strong></p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Thank you for the order.</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Your order details are as follows:</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          '<table style="border-collapse:collapse;border:none;">' +
          "    <tbody>" +
          "        <tr>" +
          '            <td style="width: 77.75pt;border: 1pt solid windowtext;padding: 0in 5.4pt;vertical-align: top;">' +
          "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Order no.</p>" +
          "            </td>" +
          '            <td style="width: 222.75pt;border-top: 1pt solid windowtext;border-right: 1pt solid windowtext;border-bottom: 1pt solid windowtext;border-image: initial;border-left: none;padding: 0in 5.4pt;vertical-align: top;">' +
          "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'><strong>[ORDERID]</strong></p>" +
          "            </td>" +
          "        </tr>" +
          "    </tbody>" +
          "</table>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Wait until you get activation email, after that you will be able to login</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Incase you need to reach out to us we&rsquo;re available on these numbers from 9:00 am to 7pm</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>+91-XXX</p>" +
          "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
          "";
        html = html.replace("[name]", data.firstName);
        html = html.replace("[ORDERID]", orderID);

        html = html.replace("[link]", `https://ikindustrial.com.au/login`);
        // console.log("emailing");
        emailSendto(
          {
            email: data.email,
            html: html,
            subject: `Welcome to the world of Ik industry – Next level support (Order no: ${orderID})`,
            text: `Welcome to the world of Ik industry – Next level support (Order no: ${orderID})`,
            results: results,
          },
          callBack
        );
        //return callBack(null, results);
      }
    );
  },
  createb: async (data, callBack) => {
    //console.log("data at create", data);
    //return "this";
    let hashPass = await hash(data.password, 10);
    pool.query(
      `insert into users(email,firstName,lastName,password,company,level,active,new)   values(?,?,?,?,?,?,?,?)`,
      [
        data.email,
        data.firstName,
        data.lastName,
        hashPass,
        data.company,
        "consumer",
        "1",
        "0",
      ],
      (error, results, fields) => {
        if (error) {
          console.log(error.sql);
          callBack(error);
        }
        const promises = [];

        //  console.log("received data attaching board", data);
        //attachtheseboards(data.ids)
        let board_ids = [data.board_id];
        promises.push(attachtheseboards(board_ids, results.insertId));

        let tempData = [];
        let newresults = [];
        Promise.all(promises).then((promisesResult) => {
          // console.log("created user detail", results);
          var orderID = results.insertId;
          let html = `
          <main style="
          position: relative;
          width: 540px;
          height: 740px;
          margin: auto;
          background: url(https://ikindustrial.com.au/IK-bg.jpeg) no-repeat center center/cover;
          display: flex;
          align-items: end;
          color: white;
          font-family: sans-serif;
          ">
          <div style="padding: 2.6rem 3.6rem">
          <h1 style="margin-bottom: 0.9rem; font-size: 2.4rem">Dear!</h1>
          <h2 style="margin-bottom: 0.9rem; font-size: 1.2rem">[name]</h2>
          <p style="font-size: 1.125rem">
          Your account has been created.
          <br />
          <br />
          You can login with your email and password below:
          <b>
          <br />
          Email:[EMAIL]<br/>
          Password:[PASSWORD]<br/>
          <br />
          <a href="https://ikindustrial.com.au/login">Click here</a> to login.
          We thank you for using IK Industrial Services for your business needs
          and we look forward to assisting  further on
          future tasks!
          </p>
          <h2 style="margin-top: 2.6rem; font-size: 1.09rem">TEAM IK</h2>
          </div>
          </main>
          `;
          /*
          var html =
            "" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;text-transform: capitalize;'>Dear <strong>&ldquo;[name]&rdquo;</strong></p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Your account has been created.</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>You can login with your email and password below:</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            '<table style="border-collapse:collapse;border:none;">' +
            "    <tbody>" +
            "        <tr>" +
            '            <td style="width: 77.75pt;border: 1pt solid windowtext;padding: 0in 5.4pt;vertical-align: top;">' +
            "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Email.</p>" +
            "            </td>" +
            '            <td style="width: 222.75pt;border-top: 1pt solid windowtext;border-right: 1pt solid windowtext;border-bottom: 1pt solid windowtext;border-image: initial;border-left: none;padding: 0in 5.4pt;vertical-align: top;">' +
            "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'><strong>[EMAIL]</strong></p>" +
            "            </td>" +
            "        </tr>" +
            "        <tr>" +
            '            <td style="width: 77.75pt;border: 1pt solid windowtext;padding: 0in 5.4pt;vertical-align: top;">' +
            "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Password.</p>" +
            "            </td>" +
            '            <td style="width: 222.75pt;border-top: 1pt solid windowtext;border-right: 1pt solid windowtext;border-bottom: 1pt solid windowtext;border-image: initial;border-left: none;padding: 0in 5.4pt;vertical-align: top;">' +
            "                <p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'><strong>[PASSWORD]</strong></p>" +
            "            </td>" +
            "        </tr>" +
            "    </tbody>" +
            "</table>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
            "";
            */

          html = html.replace("[name]", data.firstName);
          html = html.replace("[EMAIL]", data.email);

          html = html.replace("[PASSWORD]", data.password);

          html = html.replace("[link]", `https://ikindustrial.com.au/login`);
          //console.log("emailing");
          emailSendcreateto(
            {
              email: data.email,
              html: html,
              subject: `Welcome to the world of Ik industry – Next level support (Order no: ${orderID})`,
              text: `Welcome to the world of Ik industry – Next level support (Order no: ${orderID})`,
              results: results,
            },
            callBack
          );
        });
        //return callBack(null, results);
      }
    );
  },
  create_item: async (data, callBack) => {
    console.log("data at create", data);

    //console.log("first file", data.files[0]);

    //return callBack(null, results);
  },
  attachboards: async (data, callBack) => {
    const promises = [];

    console.log("received data attaching board", data);
    //attachtheseboards(data.ids)
    promises.push(deleteboards(data.user_id));
    promises.push(attachtheseboards(data.board_ids, data.user_id));
    promises.push(updateuseractivate(data.user_id));

    let tempData = [];
    let newresults = [];
    Promise.all(promises).then((promisesResult) => {
      //console.log("promisesResult", promisesResult);
      //tempData.deletestatus = promisesResult[0];
      tempData.status = promisesResult[1];
      tempData.status2 = promisesResult[2];

      newresults.push(tempData);

      var html =
        "" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;text-transform: capitalize;'>Dear <strong>&ldquo;[name]&rdquo;</strong></p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Your account has been approved.</p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>Please login to website and create tasks.</p>" +
        "<p style='margin:0in;font-size:16px;font-family:\"Calibri\",sans-serif;'>&nbsp;</p>" +
        "";
      html = html.replace("[name]", data.firstname);

      //html = html.replace("[link]", `https://ik.aryssolutions.com/login`);
      console.log("newresults", newresults);

      emailSendto(
        {
          email: data.user_email,
          html: html,
          subject: `Your account is approved on ik industry `,
          text: `Your account is approved on ik industry `,
          results: newresults,
        },
        callBack
      );

      //return callBack(null, newresults);
    });
    //return callBack(null, results);
  },
  getUsers: (callBack) => {
    pool.query(
      `select * from users where level='consumer' order by id desc`,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getusersboards: (data, callBack) => {
    pool.query(
      `select * from user_boards where user_id=?`,
      [data.id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  getalluserstoboards: (data, callBack) => {
    pool.query(
      `select * from user_board`,
      [data.id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  getnotifications: (data, callBack) => {
    body = data.body;

    let user = data.decoded.result;
    let searcharray = [];
    if (
      user.level == "admin" ||
      user.level == "areamanager" ||
      user.level == "kitchenadmin"
    ) {
      query = `select * from notifications where adminread=0 and foruser like CONCAT('%', ?,  '%')   order by id desc LIMIT 10`;
      searcharray = [user.level];
    }

    if (user.level == "emp") {
      query = `select * from notifications where  storeread='0' and store_name=? and foruser like CONCAT('%', ?,  '%')   order by id desc LIMIT 10`;
      searcharray = [body.store_name, "store"];
    }

    pool.query(query, searcharray, (error, results, fields) => {
      if (error) {
        console.log(error.sql);
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  contactus: (body, callBack) => {
    let userDetails = [];

    let html =
      "<p>Hi admin,</p><p>Here is the query from user on flax.fit</p><p><br/>Name:[name]<br />Email:[email]<br />Phone:[phone]<br />City:[pincode]<br />Pin Code:[city]<br />Query: [message]</p>";

    html = html.replace("[email]", body.email);
    html = html.replace("[name]", body.name);
    html = html.replace("[city]", body.city);
    html = html.replace("[phone]", body.phone);
    html = html.replace("[pincode]", body.pincode);
    html = html.replace("[message]", body.message);
    userDetails.subject = "Query on flax.fit";
    userDetails.text = "Query on flax.fit";
    userDetails.to = "barora@flaxfoods.in";
    userDetails.cc = "nutrition@flaxfoods.in,jatindermashall@gmail.com";
    userDetails.html = html;
    emailSendtospecific(userDetails, callBack);
  },

  forgot: ({ body, req }, callBack) => {
    var token = randtoken.generate(16);

    pool.query(
      `update users set token=? where email = ? or mobile=? `,
      [token, body.email, body.email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        let html =
          "<p>Hi [name],</p><p>There was a request to change your password!</p><p>If you did not make this request then please ignore this email.</p><p>Otherwise, please click this link to change your password: <a href='[link]'>Click Here</a></p>";
        html = html.replace("[name]", body.email);
        html = html.replace(
          "[link]",
          `https://flax.fit/recover?token=` + token
        );
        emailSend(
          {
            email: body.email,
            html: html,
          },
          callBack
        );
      }
    );
  },

  reset: ({ body, req }, callBack) => {
    //console.log(body);
    pool.query(
      `select * from users where token = ?`,
      [body.token],
      async (error, userdetails, fields) => {
        if (error) {
          //console.log(error);
          //console.log(userdetails);
          callBack(error);
        } else {
          if (userdetails.length == 0) {
            callBack("invalid token");
          } else {
            let hashPass = await hash(body.password, 10);
            pool.query(
              `update users set password=? where token = ? `,
              [hashPass, body.token],
              (error, results, fields) => {
                if (error) {
                  callBack(error);
                } else {
                  pool.query(
                    `update users set token=? where token = ? `,
                    [null, body.token],
                    (error, results, fields) => {
                      return callBack(null, "success");
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  },
};
