const express = require('express')
const multer = require('multer')
const { registerHandler, loginHandler } = require('./reg-log-api/handler')
const { getAllNoteHandler, createNoteHandler, getNoteIdHandler, editNoteHandler, deleteNoteHandler, uploadimghandler } = require('./crud-api/handler')
const router = express.Router()
const imgUpload = require ('./imgUploads/imgUpload')

router.post('/register', registerHandler)

router.post('/login', loginHandler)

router.post('/notes', createNoteHandler)

router.get('/notes', getAllNoteHandler)

router.get('/notes/:id', getNoteIdHandler)

router.post('/notes/edit', editNoteHandler)

router.delete('/notes/delete', deleteNoteHandler)

router.post('/upload', multer.single('image'), imgUpload.uploadToGcs, uploadimghandler )

module.exports = router
