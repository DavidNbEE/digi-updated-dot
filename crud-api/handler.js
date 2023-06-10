const jwt = require ('jsonwebtoken')
const {nanoid} = require ('nanoid')
const axios = require('axios')
const pool =  require('./database')
const Multer = require('multer');
const imgUpload = require('../imgUploads/imgUpload')

const multer = Multer({
  storage: Multer.memoryStorage,
  filesize: 5 * 1024 * 1024
})

const uploadimghandler = (req,res,next) => {
  const data = req.body
  if (req.file && req.file.cloudStoragePublicUrl){
    data.imageUrl = req.file.cloudStoragePublicUrl
  }
  res.send(data)
}


const createNoteHandler = async (req, res) => {
  const title = req.body;
  const authToken = req.headers.authorization;
  const file = req.file

  if (!title || !image) {
    return res.status(400).json({ error: true, message: 'title and image are missing' });
  }

  try {
    const decoded = jwt.verify(authToken, 'your-secret-key');
    const userId = decoded.id;

    const imageUrl = await uploadImage(file)

    // Make a request to the OCR API to extract text from the image
    const ocrResponse = await axios.post('https://api.ocr.space/parse/image', {
      apikey: 'YOUR_API_KEY',
      image: image,
      isOverlayRequired: true,
    });

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;

    const noteId = nanoid(16);

    const note = {
      noteId,
      userId,
      title,
      description: extractedText,
      imageUrl,
      updated: new Date(),
    };

    pool.query(
      'INSERT INTO notes (noteId, userId, title, description , imageUrl, updated) VALUES (?, ?, ?, ?, ?, ?)',
      [noteId, userId, title, note.description, imageUrl, note.updated],
      (error) => {
        if (error) {
          console.error('Error inserting note:', error);
          return res.status(500).json({ error: true, message: 'An error occurred while creating the note.' });
        }

        res.status(201).json({error : false, data : note});
      }
    );
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
};


const getAllNoteHandler = (req,res) => {
  const authToken = req.body
  //const {page, size} = req.body

  try{
    const decoded = jwt.verify(authToken, 'your-secret-key');
    const userId = decoded.id;
    //const startIndex = (page - 1) * size

    pool.query('SELECT * FROM notes where userId = ?',
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error retrieving note list:', error)
        return res.status(500).json({ error: true, message: 'An error while retrieving notes'})
      }
      if (results.length === 0){
        return res.status(404).json({error: true, message: 'No notes yes.'})
      }

      res.status(200).json({error: false, message: 'Note list retrieved', listnote: results})
    }
    )
  }
  catch(error) {
    return res.status(401).json({ error: true, message: 'invalid token ID'})
  }
}

const getNoteIdHandler = async (req, res) => {
  const { noteId } = req.params
  const authToken = req.headers.authorization

  try {
    const decoded = jwt.verify(authToken, 'your-secret-key')
    const userId = decoded.id

    pool.query('SELECT * FROM notes WHERE noteId = ? and userId = ?',
    [noteId,userId],
    (error, results) => {
      if(error){
        console.error('Error retrieving note:', error)
        return res.status(500).json({ error: true,  message: 'An error occured retrieving the note.'})
      }

      if(results.length === 0){
        return res.status(400).json({error:true, message: 'Note not found'})
      }

      const note = results[0]
      res.status(200).json(note)
    })
  }
  catch(error){
    return res.status(401).json({error: true, message:'Invalid token'})
  }
}

const editNoteHandler = async (req, res) => {
  const { id } = req.params
  const { title, tags, body } = req.body
  const token = req.headers.authorization

  try {
    const decoded = jwt.verify(token, 'your-secret-key')
    const userId = decoded.id

    if (!title && !tags && !body) {
      return res.status(400).json({ error: true, message: 'Please provide at least one field to update (title, tags, or body).' })
    }

    let updateFields = []
    let queryParams = []
    
    if (title) {
      updateFields.push('title = ?')
      queryParams.push(title)
    }

    if (tags) {
      updateFields.push('tags = ?')
      queryParams.push(tags)
    }

    if (body) {
      updateFields.push('body = ?')
      queryParams.push(body)
    }

    updateFields.push('updated = ?')
    queryParams.push(new Date())

    queryParams.push(id)
    queryParams.push(userId)

    pool.query(
      `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      queryParams,
      (error, results) => {
        if (error) {
          console.error('Error updating note:', error);
          return res.status(500).json({ error: true, message: 'An error occurred while updating the note.' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: true, message: 'Note not found or not authorized to update.' });
        }

        const updatedNote = {
          id,
          userId,
          title,
          tags,
          body,
          updated: new Date(),
        }

        res.status(200).json(updatedNote);
      }
    )
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
}

const deleteNoteHandler = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    const userId = decoded.id;

    pool.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [id, userId],
      (error, results) => {
        if (error) {
          console.error('Error deleting note:', error);
          return res.status(500).json({ error: true, message: 'An error occurred while deleting the note.' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: true, message: 'Note not found or not authorized to delete.' });
        }

        res.status(200).json({ success: true, message: 'Note deleted successfully.' });
      }
    );
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
};




  module.exports = {
    createNoteHandler, 
    getAllNoteHandler, 
    getNoteIdHandler,
    editNoteHandler,
    deleteNoteHandler,
    uploadimghandler} 