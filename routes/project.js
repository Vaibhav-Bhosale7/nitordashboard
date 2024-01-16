const express = require('express');
const { userlist,projectlist,workitems } = require('../controllers/project');

const router = express.Router();

//router.post('/listdata', projectlistdata);


//router.post('/workitemsdata', workitemlistdata);

router.post('/list', projectlist);

router.post('/workitems', workitems);
router.post('/userlist', userlist);

module.exports = router;