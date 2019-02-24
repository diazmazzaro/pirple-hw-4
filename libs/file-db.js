/*
 * Library for storing and editing data on file system
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var utils = require('./utils');

// Container for module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = utils.config.fileDbRoot;

// Get or create root directory
lib.getRootPath = function (create) {
  var dirExists = fs.existsSync(lib.baseDir);

  // If not, create the directory
  if(!dirExists && create){
    fs.mkdirSync(lib.baseDir, { recursive: true, mode: 777 })
  }
  
  return lib.baseDir;
}

// Get path for file (optional, could be created)
lib.getPath = function(dir, file, create){
  var _root = lib.getRootPath(create);
  var _dir = path.resolve(_root, dir);
  var _file = /(\.josn)$/i.test(file) ? file : (file + '.json');

  var dirExists = fs.existsSync(_dir);

  // If not, create the directory
  if(!dirExists && create){
    fs.mkdirSync(_dir, { recursive: true, mode: 777 })
  }

  if(file) return path.resolve(_dir, _file);
  return _dir + '/';
}

// Write data to a file
lib.create = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(lib.getPath(dir, file, true), 'wx', (err, fileDescriptor) => {
    if(!err && fileDescriptor){
      console.log(err)
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,(err) => {
        if(!err){
          fs.close(fileDescriptor,(err) => {
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

// Read data from a file
lib.read = function(dir,file,callback){
  try{
    fs.readFile(lib.getPath(dir, file), 'utf8', function(err,data){
      if(!err && data){
        var parsedData = utils.parseJSON(data);
        callback(false,parsedData);
      } else {
        callback(err,data);
      }
    });  
  }
  catch(err){
    callback(err,data);
  }
  
};

// Update data in a file
lib.update = function(dir,file,data,callback){

  // Open the file for writing
  fs.open(lib.getPath(dir, file), 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor,function(err){
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData,function(err){
            if(!err){
              fs.close(fileDescriptor,function(err){
                if(!err){
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

// Delete a file
lib.delete = function(dir,file,callback){

  // Unlink the file from the filesystem
  fs.unlink(lib.getPath(dir, file), function(err){
    callback(err);
  });

};

// List all the items in a directory
lib.list = function(dir,callback){
  fs.readdir(lib.getPath(dir), function(err,data){
    if(!err && data && data.length > 0){
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false,trimmedFileNames);
    } else {
      callback(err,data);
    }
  });
};

// Export the module
module.exports = lib;
