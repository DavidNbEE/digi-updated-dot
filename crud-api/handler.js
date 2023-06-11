const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const axios = require('axios')
const pool =  require('./database')
const imgUpload = require('../imgUploads/imgUpload')
secretKey = "diginote-secret"

const uploadimghandler = (req,res,next) => {
  const data = req.body
  if (req.file && req.file.cloudStoragePublicUrl){
    data.imageUrl = req.file.cloudStoragePublicUrl
  }
  const urlphoto = data.imageUrl
  res.status(200).json({error: true, message :" data", data, urlphoto})
}

const createNoteHandler2 = async (req, res) => {
  const {title,body} = req.body;
  const authToken = req.headers.authorization
  const secretKey = "diginote-secret"

  if (!title || !body) {
    return res.status(400).json({ error: true, message: 'input the title and image' });
  }
  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }
    const decode = jwt.verify(authToken, secretKey);
    const decoded = decode.userId
    const userId = decoded
    const noteId = uuidv4();
    const note = {
      noteId,
      userId,
      title,
      body,
      updated: new Date(),
    };

    pool.query(
      'INSERT INTO notes2 (noteId, userId, title, body, updated) VALUES (?, ?, ?, ?, ?)',
      [noteId, note.userId, title, note.body, note.updated],
      (error) => {
        if (error) {
          console.error('Error inserting note:', error);
          return res.status(500).json({ error: true, message: 'An error occurred while creating the note.' });
        }

        res.status(201).json({error : false, message: 'Note Created!', note});
      }
    );
};

const createNoteHandler = async (req, res) => {
  const {title, data} = req.body;
  const authToken = req.headers.authorization;
  const secretKey = "diginote-secret"

  if (!title || !data) {
    return res.status(400).json({ error: true, message: 'input the title and image' });
  }

  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }

  const decode = jwt.verify(authToken, secretKey);
  const decoded = decode.userId
  const userId = decoded

  const flaskresponse = await axios.post('linkAPIML', data, {
    headers: {
      'Content-Type' : 'multipart/form-data',
    }
  })
  const predictions = flaskresponse.data.predictions
  const extractedText = predictions

  if (req.file && req.file.cloudStoragePublicUrl){
    data.imageUrl = req.file.cloudStoragePublicUrl
  }
  const urlphoto = data.imageUrl
    
  const noteId = nanoid(16);
  const note = {
    noteId,
    userId,
    title,
    description: extractedText,
    imageUrl : urlphoto,
    updated: new Date(),
  };

  pool.query(
    'INSERT INTO notes (noteId, userId, title, description , imageUrl, updated) VALUES (?, ?, ?, ?, ?, ?)',
    [noteId, userId, title, note.description, note.imageUrl, note.updated],
    (error) => {
      if (error) {
        console.error('Error inserting note:', error);
        return res.status(500).json({ error: true, message: 'An error occurred while creating the note.' });
      }

      res.status(201).json({error : false, message: 'Note Created!', note});
    }
  );
};


const getAllNoteHandler = (req,res) => {
  const authToken = req.headers.authorization
  //const {page, size} = req.body
  const secretKey = "diginote-secret"
  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }

  const decode = jwt.verify(authToken, secretKey);
  const decoded = decode.userId
  const userId = decoded

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

    res.status(200).json({error: false, message: 'All Notes retrieved', listnote: results})
  })
}

const getNoteIdHandler = async (req, res) => {
  const { noteId } = req.params
  const authToken = req.headers.authorization
  const secretKey = "diginote-secret"

  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }

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
    res.status(200).json({error: false, message: 'Note retrieved', note})
  })
}

const editNoteHandler = async (req, res) => {
  const { noteId } = req.params
  const { title, description } = req.body
  const authToken = req.headers.authorization
  const secretKey = "diginote-secret"

  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }

  const decode = jwt.verify(authToken, secretKey);
  const decoded = decode.userId
  const userId = decoded

  if (!title && !description) {
    return res.status(400).json({ error: true, message: 'Please provide title or description' })
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

  if (description) {
    updateFields.push('description = ?')
    queryParams.push(description)
  }

  updateFields.push('updated = ?')
  queryParams.push(new Date())

  queryParams.push(noteId)
  queryParams.push(userId)

  pool.query(
    `UPDATE notes SET ${updateFields.join(', ')} WHERE noteId = ? AND userId = ?`,
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
        noteId,
        title,
        tags,
        body,
        updated: new Date(),
      }

      res.status(200).json(updatedNote);
    })
}

const deleteNoteHandler = async (req, res) => {
  const { noteId } = req.params;
  const authToken = req.headers.authorization;
  secretKey = "diginote-secret"

  try {
    jwt.verify(authToken, secretKey);
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Unauthorized. Invalid token.' });
  }
  const decode = jwt.verify(authToken, secretKey);
  const decoded = decode.userId
  const userId = decoded

  pool.query(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [noteId, userId],
    (error, results) => {
      if (error) {
        console.error('Error deleting note:', error);
        return res.status(500).json({ error: true, message: 'An error occurred while deleting the note.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Note not found or not authorized to delete.' });
      }

      res.status(200).json({ success: true, message: 'Note deleted successfully.' });
    });
};




  module.exports = {
    createNoteHandler, 
    getAllNoteHandler, 
    getNoteIdHandler,
    editNoteHandler,
    deleteNoteHandler,
    uploadimghandler,
    createNoteHandler2} 