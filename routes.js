const express = require('express')
const multer = require('multer')
const { registerHandler, loginHandler } = require('./reg-log-api/handler')
const { getAllNoteHandler, createNoteHandler, getNoteIdHandler, editNoteHandler, deleteNoteHandler, handleImageUpload } = require('./crud-api/handler')
const router = express.Router()
const upload = multer({dest: 'uploads/'})

router.post('/register', registerHandler)

router.post('/login', loginHandler)

router.post('/notes', createNoteHandler)

router.get('/notes', getAllNoteHandler)

router.get('/notes/:id', getNoteIdHandler)

router.post('/notes/edit', editNoteHandler)

router.delete('/notes/delete', deleteNoteHandler)

router.post('/upload', upload.single('image'), handleImageUpload)

module.exports = router
