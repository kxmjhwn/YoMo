const body_parser = require("body-parser");
const express = require("express");
const logger = require("morgan");
const multer = require("multer");    // Multer는 파일 업로드를 위해 사용되는 multipart/form-data 를 다루기 위한 node.js의 미들웨어(body-parser는 multipart body를 다루지 않음, multipart도 다루기 위해서 multer를 사용)
const path = require("path");
const fs = require("fs");
const moment = require("moment")
const cmd = require("node-cmd");
const static = require("static");
require("moment-timezone");

//const {PythonShell} = require('python-shell')
//const cors = require('cors');

const ABSOLUTE_UPLOAD_DIR = __dirname + `/public/uploads/`  // 저장될 파일의 서버상 절대 경로
const ABSOLUTE_DOWNLOAD_DIR = __dirname + `/public/downloads/` // 클라이언트에서 다운받을 파일의 서버상 절대 경로

const RELATIVE_UPLOAD_DIR = "/uploads/"  // 클라이언트가 upload한 파일을 요청할 경로
const RELATIVE_DOWNLOAD_DIR = "/downloads/"  // 클라이언트가 download할 파일을 요청할 경로


const storage = multer.diskStorage({    // https://victorydntmd.tistory.com/39 참조
    destination : function(req, file, callback){
        callback(null, ABSOLUTE_UPLOAD_DIR)
    },

    filename : function(req, file, callback){
        const time = moment().format("YYYY.MM.DD_HH-mm-ss")
        const file_originalname = file.originalname
        const extension = path.extname(file_originalname);
        const basename = path.basename(file_originalname, extension)    // 확장자 제거한 basename

        console.log(basename)
        console.log(extension)

        callback(null, `${basename}_${time}${extension}`)
    }
})
const upload = multer({storage : storage});  

const app = express();

//app.use(cors());
moment.tz.setDefault("Asia/Seoul");
app.use(logger( "dev", fs.createWriteStream("server.log", {flags : "w"})));
app.use(express.static(path.join(__dirname,  "./public")));
app.use(body_parser.urlencoded({extended : true}));    // https://blog.naver.com/PostView.nhn?blogId=writer0713&logNo=221278208411&parentCategoryNo=&categoryNo=100&viewDate=&isShowPopularPosts=false&from=postView 참조
app.use(body_parser.json())

function delay(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

class Response{
    constructor(){
        this.error = false
        this.messagse = ""
        this.filePath = ""
        this.fileName = ""
    }
}

/* 동영상 업로드  */
app.post("/upload", upload.single("selectFile"), (req, res) => {
    const result = new Response()
    //const originalname = req.file.originalname
    const filename = req.file.filename  // multer.diskStorage에서 req.file.filename을 변경해줬기 때문에 따로 originalname을 사용할 필요 없음

    result.filePath = RELATIVE_UPLOAD_DIR + filename
    res.send(result)
})


/* 모자이크 Go! */
app.post("/mosaic", async (req, res) => {
    const result = new Response();
    const mosaic_option =  req.body;
    let option_list = []

    for(element in mosaic_option){  
        option_list.push(mosaic_option[element])    // option의 value만 list에 push
    }
    
    console.log(mosaic_option);

    option_list.push(ABSOLUTE_UPLOAD_DIR)
    option_list.push(ABSOLUTE_DOWNLOAD_DIR)
    option_list = option_list.join(" ")
    
    await delay(5000)
    
    /*
    // 방법 2
    await new Promise((resolve, reject) => {
        cmd.get(
            `python C:/Users/wodn5/Anaconda3/envs/YOLOdark/darkflow/testyolo.py ${option_list}` , 
            function(error, stdout, stderr) {
                if(error) {
                    console.log( "ERROR : ", error);
                } else {
                    console.log( "SUCCESS : ", stdout);
                }
                resolve()
            }
        )
    }) // TODO: 파이썬 프로그램에서 downloads directory에 모자이크 처리한 동영상 파일을 저장
 */

    const input = fs.createReadStream(ABSOLUTE_UPLOAD_DIR + mosaic_option.filename);
    const output = fs.createWriteStream(ABSOLUTE_DOWNLOAD_DIR + mosaic_option.filename);    
    input.pipe(output); // TODO: 테스트를 위해 파일 복사 사용, python 프로그램 결합하면, 코드 제거

    result.filePath = RELATIVE_DOWNLOAD_DIR + mosaic_option.filename
    result.fileName = mosaic_option.filename
    res.send(result);    // TODO: download 파일 path와 filename 전달
})


/* 동영상 다운로드 */
app.post("/download", async (req, res) => {
    const file_path = ABSOLUTE_DOWNLOAD_DIR + req.body.downloadFileName;
    let file_name = path.basename(file_path);
    
    console.log(file_name + " 파일 요청!")

    let is_exist = fs.existsSync(file_path)   // 해당 파일이 downloads 디렉토리에 존재하는지 확인.

    if(is_exist === false){  // 해당 파일이 downloads 디렉토리에 존재하지 않으면 404로 응답
        return res.status(404).send()
    }

    const readStream = fs.createReadStream(file_path);

    let encoded_file_name = encodeURI(file_name); // Content-Disposition에 한글을 사용하면 오류가 발생해서 인코딩된 문자열을 사용함.

    res.set({  
        "Content-Type" : 'video/mp4',
        "Content-Disposition" : "attachment; filename=" + encoded_file_name,
        "Access-Control-Expose-Headers" : "Content-Disposition" // xmlhttprequest를 사용했을 때, Refused to get unsafe header "Content-Disposition"에러가 발생하고 ajax를 사용하면, response에 "Content-Disposition"가 포함되어 있지 않아 추가해줌 (https://dicksonkho.com/software-road/refused-to-get-unsafe-header-content-disposition/ 참조)
    }); // res.setHeader(), res.header() 차이 - https://stackoverflow.com/questions/40840852/difference-between-res-setheader-and-res-header-in-node-js참조 (헤더를 여러개 지정할 수 있느냐 없느냐 차이인듯.)

    try{    // 요청한 파일을 전송한 다음에 파일을 삭제하기 위해 Promise를 사용함 (카카오톡 사진 참조)
        await new Promise(function(resolve, reject){
            readStream  // 출력스트림.pipe(입력스트림)
                .on('Error', Error) // ReadStream
                .pipe(res)
                .on('Error', Error) // WriteStream
                .on('finish', finish);  // WriteStream
            
            function finish(){
                console.log(`${file_name} 전송 완료`);   // 전송 완료되면 resolve
                return resolve();
            }
            
            function Error(err){
                return reject(err);
            }
        })
    }catch(err){
        console.log(err)
    }
    /*
    fs.unlink(file_path, err => { // 요청한 파일을 전송한 뒤 파일을 삭제함.
        if(err){
            console.log(`${file_name} 파일 삭제 실패!`)
        }
        else{
            console.log(`${file_name} 파일 삭제 완료!`)
        }
    });*/ 
})
 
app.listen("3030", () =>{
    console.log("server listening on port 3030!")
})