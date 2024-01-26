const pool = require("../../config/database");
var randtoken = require("rand-token");
const express = require("express");
const { hash } = require("bcrypt");
const axios = require("axios");
const debug = require("debug")("app:api");
const app = express();
const FormData = require("form-data");
const fs = require("fs");
const moment = require("moment");
const headers = {
  "Content-Type": "application/json",
  Authorization: process.env.Monday_Api_Key,
};
const headers_upload_file = {
  "Content-Type": "application/json",
  Authorization: process.env.Monday_Api_Key,
  "Access-Control-Allow-Origin": "*",
};
const listwebhooks = (board_id) => {
  let query = `query {
    webhooks(board_id: ${board_id}){
      id
      event
      board_id
      config
    }
  }
`;
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
        resolve(response.data);
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const create_task = (data) => {
  let query = `mutation {
    create_item (board_id: ${data.boardid}, item_name: "${data.title}") {
        id
    }
}`;
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
        resolve(response.data);
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const update_task = (data) => {
  let query = `mutation {
    create_update (item_id: ${data.itemid}, body: "${data.description}") {
        id
    }
}`;
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
        resolve(response.data);
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const uploadfile_monday = (data) => {
  console.log("data with file", data);
  //const formData = new FormData();
  //formData.append("variables[file]", data.filecontent);
  const formData = new FormData();
  const fileStream = fs.createReadStream(data.filecontent.path);
  formData.append("variables[file]", fileStream);
  let config = {
    method: "POST",
    url: "https://api.monday.com/v2/file",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: process.env.Monday_Api_Key,
      "Access-Control-Allow-Origin": "*",
    },
    params: {
      query: `
      mutation ($file: File!) {
        add_file_to_column (file: $file, item_id: ${data.itemid}, column_id: "files") {
          id
        }
      }
    `,
    },
  };

  return new Promise((resolve, reject) => {
    axios
      .request(config)
      .then((response) => {
        resolve(response.data);
        console.log("upload file api respnse", response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const createnewwebhook = (data) => {
  let url = "https://ik-back.vercel.app/webhookdata";
  let query = `mutation {
    create_webhook (board_id: ${data.board_id}, url:"${url}", event: change_subitem_column_value) {
      id
      board_id
    }
  }
`;
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
        console.log("webhook created", JSON.stringify(response.data));
        resolve(response.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log("error", error);
        reject(error);
      });
  });
};

module.exports = {
  gettaskdetail: (data, callBack) => {
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

    axios
      .request(config)
      .then((response) => {
        callBack(null, response.data.data.items[0]);
        //console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  },
  createtask: async (data, callBack) => {
    const promises = [];
    //console.log("all data", data.body);
    //  console.log("received data attaching board", data);
    //attachtheseboards(data.ids)
    let otherdata = data.body;
    create_task(otherdata)
      .then((r1) => {
        //let r2 = JSON.parse(r1);
        //console.log("result from first", r1);
        update_task({
          itemid: r1?.data?.create_item?.id,
          description: otherdata.description,
        });
        return { itemid: r1?.data?.create_item?.id };
      })
      .then((r2) => {
        //console.log("r2", r2);
        if (data.file != undefined) {
          uploadfile_monday({
            itemid: r2?.itemid,
            filecontent: data.file,
          });
        }
        callBack(null, "Task created");
      })

      .catch((error) => {
        console.error("An error occurred:", error);
        callBack(error, []);
      });
  },

  createwebhook: (data, callBack) => {
    const promises = [];

    //  console.log("received data attaching board", data);
    //attachtheseboards(data.ids)
    let board_ids = [data.board_id];
    promises.push(listwebhooks(data.board_id));

    let datar = [];
    Promise.all(promises).then((promisesResult) => {
      datar = promisesResult;
      console.log("promisesResult", datar[0].data.webhooks.length);

      if (datar[0].data.webhooks.length == 0) {
        createnewwebhook(data);
        callBack(null, { result: "webhook created" });
      } else {
        callBack(null, { result: "webhook exist" });
      }
      //return { datar };
    });
  },
};
