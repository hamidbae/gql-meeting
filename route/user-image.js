const express = require('express')
const router = express.Router()
const cloudinary = require('../utils/cloudinary')
const upload = require('../utils/multer')

router.post('/', upload.single('image'), async (req, res) => {
    if(!req.file) {
        return res.status(200).json({ message: 'No file provided!' })
    }
    try{
        const result = await cloudinary.uploader.upload(req.file.path)
        res.status(200).json({ imageUrl: result.secure_url, cloudinary_id: result.public_id})
    }catch(err){
        console.log(err)
    }
})

module.exports = router