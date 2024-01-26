const { hashSync, genSaltSync, compareSync } = require("bcrypt");

const multer = require("multer");
const { sign } = require("jsonwebtoken");
const pool = require("../../config/database");
let upload = multer();
const { gettaskdetail, createwebhook, createtask } = require("./mon.service");
const { emailSendto } = require("../email/email.controller");
const moment = require("moment");
const axios = require("axios");
const headers = {
  "Content-Type": "application/json",
  Authorization: process.env.Monday_Api_Key,
};
const Gettaskdetail = (data) => {
  //console.log("we are in Gettaskdetail", data);
  let query = `query { items (ids: [${data.taskid}]) { name
    id
    created_at
    updated_at
    column_values(ids: "status") {
      id
      value
      text
      
    } }}`;
  let quryjson = JSON.stringify({
    query: query,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.monday.com/v2",
    headers: headers,
    data: quryjson,
  };

  return new Promise((resolve, reject) => {
    axios
      .request(config)
      .then((response) => {
        const resData = response.data;
        if (Array.isArray(resData.errors) && resData.errors.length) {
          return reject(resData.errors[0].message);
        }
        resolve(JSON.stringify(response.data));

        return response.data;
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const Gettasks = (req) => {
  //console.log("getstasks body", req);
  let query = `query { boards (ids: ${req.value}) { items {
      name
      id
      created_at
      updated_at
      column_values(ids: "status") {
        id
        value
        text
        
      }
    } }}`;
  let quryjson = JSON.stringify({
    query: query,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.monday.com/v2",
    headers: headers,
    data: quryjson,
  };

  return new Promise((resolve, reject) => {
    axios
      .request(config)
      .then((response) => {
        const resData = response.data;

        console.log(response.data);
        if (Array.isArray(resData.errors) && resData.errors.length) {
          return reject(resData.errors[0].message);
        }
        //console.log("response.data", response.data);

        resolve(response.data);
        return response.data;
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};
module.exports = {
  getTaskdetail: (req, res) => {
    gettaskdetail(req.body, (err, results) => {
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
  listTasks: async (req, res) => {
    //Gettasks(req.body);
    const promises = [];
    let retdata = await Gettasks(req.body);
    return res.json({
      success: 1,
      data: retdata,
    });
  },
  createtask: (req, res) => {
    //console.log("req.file", req.file);
    createtask(req, (err, results) => {
      if (err) {
        console.log(err);
        return res.json({
          success: 0,
          data: err,
        });
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  createWebhook: (req, res) => {
    createwebhook(req.body, (err, results) => {
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
  Webhookdata: async (req, res) => {
    const webhookData = req.body;

    console.log("webhookData", webhookData);
    let statusupdate = webhookData.event.value.label;
    let boardId = webhookData.event.boardId;

    const promises = [];
    let retdata = await Gettaskdetail({ taskid: webhookData.event.pulseId });
    console.log("retdata", retdata);

    pool.query(
      `select * from users  where id in (select user_id from user_boards where board_id=? )`,
      [boardId],
      (error, results, fields) => {
        if (error) {
          console.log("sql", error.sql);
          callBack(error);
        }
        //console.log("get email id of the customer", results);

        //return callBack(null, results[0]);
        /*
webhookData {
  index: 1,
  text: 'Done',
  style: { color: '#00c875', border: '#00B461', var_name: 'green-shadow' },
  is_done: true
}
we are in Gettaskdetail { taskid: 1838740928 }
promises results [
  '{"data":{"items":[{"name":"this is my test without file uploading","id":"1838740928","created_at":"2024-01-18T07:48:32Z","updated_at":"2024-01-19T08:13:13Z","column_values":[{"id":"status","value":"{\\"index\\":1,\\"post_id\\":null,\\"changed_at\\":\\"2024-01-19T08:13:13.209Z\\"}","text":"Done"}]}]},"account_id":16959863}'
]


*/
        // You can perform any desired operations with the webhook data here

        //let retdata = Gettaskdetail({ taskid: webhookData.event.pulseId });

        if (
          webhookData.event.value.label != undefined &&
          webhookData.event.columnId == "status"
        ) {
          let webhoojson = JSON.stringify(webhookData);
          const todayDate = moment().format("YYYY-MM-DD");

          let taskdetail;

          //console.log("webhookData.event", webhookData.event);

          //promises.push(Gettaskdetail({ taskid: webhookData.event.pulseId }));

          let tempData = [];
          let newresults = [];

          // console.log("created user detail", results);

          //let r2 = JSON.parse(r1);
          //console.log("result from first", r1?.data);
          taskdetail = retdata;

          console.log("task detail for email notification", taskdetail);

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
<h1 style="margin-bottom: 0.9rem; font-size: 2.4rem">Hello!</h1>
<h2 style="margin-bottom: 0.9rem; font-size: 1.2rem">{CLIENT_NAME}</h2>
<p style="font-size: 1.125rem">
That's a wrap! Another successful <b>{TASK_TITLE} </b>x IK task
has been completed!
<br />
<br />
Login to the IK Industrial Services Portal to view and/ or comment on
<b>{TASK_TITLE} </b> completed on “task completion date ${todayDate}”!
<br />
<br />
Once you have reviewed and are happy with results for <b>{TASK_TITLE} </b>,
please follow the prompts to close out the action.
<br />
<br />
We thank you for using IK Industrial Services for your business needs
and we look forward to assisting  further on
future tasks!
</p>
<h2 style="margin-top: 2.6rem; font-size: 1.09rem">TEAM IK</h2>
</div>
</main>
`;

          //console.log("emailing");
          html = html.replace("{CLIENT_NAME}", results[0]?.firstName);
          html = html.replace(
            "{TASKSTATUS}",
            webhookData.event.value.label.text
          );
          html = html.replace("{TASK_TITLE}", webhookData.event.pulseName);

          emailSendto({
            email: results[0]?.email,
            firstName: results[0]?.firstName,
            html: html,
            subject:
              `Ik industry says your task status updated to ` +
              webhookData.event.value.label.text,
            text: `Ik industry says your task is done`,
            results: results,
          });

          return res.json({
            success: 1,
            data: "Your message is sent.",
          });
        }
      }
    );
    // Return the same data in the response
  },
};
