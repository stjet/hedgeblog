import { createServer } from 'http';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';

const port: number = 8042;

createServer((req, res) => {
  let req_path: string;
  if (!req.url.includes(".")) {
    req_path = path.join(__dirname, "build", req.url, "index.html");
  } else {
    req_path = path.join(__dirname, "build", req.url);
  }
  if (!existsSync(req_path)) {
    res.writeHead(404);
    //write file
    res.write("404");
    return res.end();
  }
  //set content type
  let non_utf8_content_types: string[] = ["image/png", "image/gif"];
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
    case "png":
    case "ico":
      content_type = "image/png";
      break;
    case "gif":
      content_type = "image/gif";
      break;
    default:
      content_type = "text/plain";
  }
  res.writeHead(200, {
    'Content-Type': content_type,
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