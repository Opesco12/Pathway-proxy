const express = require("express");
const axios = require("axios");
const https = require("https");
const http = require("http");
const bodyParser = require("body-parser");
const proxy = require("express-http-proxy");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  "/api/v1",
  proxy("https://102.207.208.18:6545", {
    proxyReqPathResolver: (req) => {
      console.log("Resolving path:", req.url);
      return "/api/v1" + req.url;
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      console.log("Decorating proxy request options");
      proxyReqOpts.rejectUnauthorized = false;
      return proxyReqOpts;
    },
    proxyReqBodyDecorator: (bodyContent, srcReq) => {
      //   console.log("Proxying request:", srcReq.method, srcReq.url);
      //   console.log("Headers:", JSON.stringify(srcReq.headers, null, 2));

      if (bodyContent) {
        let parsedBody;
        if (
          typeof bodyContent === "object" &&
          !(bodyContent instanceof Buffer)
        ) {
          parsedBody = bodyContent;
        } else {
          try {
            parsedBody = JSON.parse(bodyContent.toString());
          } catch (e) {
            console.log("Unable to parse body as JSON");
            return bodyContent;
          }
        }
        // console.log("Parsed body:", JSON.stringify(parsedBody, null, 2));
        return JSON.stringify(parsedBody);
      } else {
        // console.log("No body content");
        return bodyContent;
      }
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      //   console.log("Response status:", proxyRes.statusCode);
      //   console.log(
      //     "Response headers:",
      //     JSON.stringify(proxyRes.headers, null, 2)
      //   );
      //   console.log("Response data:", proxyResData.toString("utf8"));
      return proxyResData;
    },
  })
);

app.listen(port, () => console.log("APP is listening on port 3000"));
