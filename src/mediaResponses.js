const fs = require('fs');
const path = require('path');


const loadFile = (request, response, filePath, contentType) => {
  // get file path to the mp4
  const file = path.resolve(__dirname, filePath);


  fs.stat(file, (err, stats) => {
    // 404 error head
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    // byte range from request headers
    let {
      range,
    } = request.headers;

    // if there is no range, set up the start with an unknown end range
    if (!range) {
      range = 'bytes=0-';
    }

    // converts the byte string into an array of strings
    const positions = range.replace(/bytes=/, '').split('-');
    // sets the first string in the array to a num in base 10
    let start = parseInt(positions[0], 10);

    // gives the total file size in bytes
    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    // gets the chunk size of the file being sent to the client
    const chunksize = (end - start) + 1;

    // writes the 206 success code, with info on the file being sent
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });

    // create a file stream to send the media file
    const stream = fs.createReadStream(file, {
      start,
      end,
    });

    // maintains file stream as long as bytes can still be sent
    stream.on('open', () => {
      stream.pipe(response);
    });

    // stops the stream if errors
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};
const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};
const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mp3');
};


module.exports.getParty = getParty;
module.exports.getBird = getBird;
module.exports.getBling = getBling;
