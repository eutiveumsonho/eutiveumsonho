import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });

const emailParams = (params) => {
  const { to, subject, html, text, from } = params;

  return {
    Destination: {
      /* required */
      CcAddresses: [
        to,
        /* more items */
      ],
      ToAddresses: [
        to,
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: from /* required */,
    ReplyToAddresses: [
      "marcelo@eutiveumsonho.com",
      /* more items */
    ],
  };
};

// Create the promise and SES service object
export async function sendEmail(params) {
  return new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(emailParams(params))
    .promise();
}
