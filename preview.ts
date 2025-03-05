import { createServer } from "http";
import * as path from "path";
import { existsSync, readFileSync } from "fs";

const port: number = 8042;

createServer((req, res) => {
  let req_path: string;
  if (!req.url.includes(".")) {
    req_path = path.join(__dirname, "build", req.url, "index.html");
  } else {
    req_path = path.join(__dirname, "build", req.url);
  }
  let status_code = 200;
  //req.url.includes("..")
  if (!req_path.startsWith(path.join(__dirname, "build"))) {
    //nice try, bad request
    res.writeHead(400);
    res.write("400");
    return res.end();
  } else if (!existsSync(req_path)) {
    status_code = 404;
    //serve 404 page instead of non-existent page
    req_path = path.join(__dirname, "build", "404.html");
  }
  //set content type
  let non_utf8_content_types: string[] = ["image/png", "image/gif", "image/jpeg", "video/mp4"];
  let content_type: string;
  switch (req_path.split(".")[1]) {
    case "html":
      content_type = "text/html; charset=utf-8";
      break;
    case "css":
      content_type = "text/css; charset=utf-8";
      break;
    case "js":
      content_type = "text/javascript";
      break;
    case "xml":
      content_type = "text/xml";
      break;
    case "png":
    case "ico":
      content_type = "image/png";
      break;
    case "gif":
      content_type = "image/gif";
      break;
    case "jpg":
      content_type = "image/jpeg";
      break;
    case "mp4":
      content_type = "video/mp4";
      break;
    default:
      content_type = "text/plain";
  }
  res.writeHead(status_code, {
    "Content-Type": content_type,
  });
  //write file
  if (non_utf8_content_types.includes(content_type)) {
    res.write(readFileSync(req_path));
  } else {
    res.write(readFileSync(req_path, "utf-8"));
  }
  //end response
  res.end();
}).listen(port);

console.log(`Preview on port ${port}`);
