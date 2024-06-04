
import React, { useState } from 'react';
import { storage } from './firebaseConfig';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const storageRef = storage.ref(`uploads/${file.name}`);
      const uploadTask = storageRef.put(file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload failed', error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            setUrl(downloadURL);
            console.log('File available at', downloadURL);
          });
        }
      );
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      <progress value={progress} max="100" />
      {url && <p>File available at: <a href={url}>{url}</a></p>}
    </div>
  );
};

export default FileUpload;
