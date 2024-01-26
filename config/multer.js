const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
	destination: function (_, __, cb) {
		const dirPath = path.join(__dirname, '../uploads');
		// const dirPath = path.join(__dirname, '../../../public/uploads');
		cb(null, dirPath);
	},

	filename: function (_, file, cb) {
		cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`);
	},
});

var upload = multer({
	storage: storage,
});

module.exports = upload;