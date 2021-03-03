const path = require('path')
const multer = require('multer')

const fileStorage = multer.diskStorage({})
const fileFilter = (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
        cb(new Error('File type is not supported!'), false)
        return
    }
    cb(null, true)
}

module.exports = multer({storage: fileStorage, fileFilter: fileFilter})