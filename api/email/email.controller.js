var Nodemailer = require("nodemailer");
const request = require("request");
module.exports = {
  emailSendto: (userDetails) => {
    // try {

    console.log("email sending");
    // emailid = process.env.MainEmailid;
    //console.log("emailid", emailid);
    // emailpassword = process.env.MainEmailpassword;

    const options = {
      method: "POST",
      url: "https://api.mailjet.com/v3.1/send",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          new Buffer.from(
            "224db0a5e3c0233069aa0b14fbfdceae:1bbd7c16338e1c09436525de1d6607a0"
          ).toString("base64"),
      },
      json: true,
      body: {
        Messages: [
          {
            From: {
              Email: "noreply@ikindustrial.com.au",
              Name: "IK Industry",
            },
            To: [
              {
                Email: userDetails.email,
                Name: userDetails.firstName,
              },
            ],
            Bcc: [],
            Subject: userDetails.subject,
            TextPart: userDetails.text,
            HTMLPart: userDetails.html,
          },
        ],
      },
    };
    request(options, (error, response, body) => {
      //console.log("error", error);
      console.log("response", response);
      //return { message: "your messages is sent" };
      if (!error && response.statusCode == 200) {
        console.log("response", response);
        //callBack(null, userDetails.results);
        //res.send(body);
      } else {
        //console.log("error", error);
        //res.send(error);
      }
    });
  },

  emailSendcreateto: (userDetails, callBack) => {
    // try {

    console.log("email sending");
    // emailid = process.env.MainEmailid;
    //console.log("emailid", emailid);
    // emailpassword = process.env.MainEmailpassword;

    const options = {
      method: "POST",
      url: "https://api.mailjet.com/v3.1/send",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          new Buffer.from(
            "224db0a5e3c0233069aa0b14fbfdceae:1bbd7c16338e1c09436525de1d6607a0"
          ).toString("base64"),
      },
      json: true,
      body: {
        Messages: [
          {
            From: {
              Email: "noreply@ikindustrial.com.au",
              Name: "IK Industry",
            },
            To: [
              {
                Email: userDetails.email,
                Name: userDetails.firstName,
              },
            ],
            Bcc: [],
            Subject: userDetails.subject,
            TextPart: userDetails.text,
            HTMLPart: userDetails.html,
          },
        ],
      },
    };
    request(options, (error, response, body) => {
      //console.log("error", error);
      //console.log("response", response);
      return callBack(null, userDetails.results);
      //return { message: "your messages is sent" };
      if (!error && response.statusCode == 200) {
        console.log("response", response);
        //callBack(null, userDetails.results);
        //res.send(body);
      } else {
        //console.log("error", error);
        //res.send(error);
      }
    });
  },
};
